// dependencies
const mongoose = require('mongoose');
const objectMapper = require('object-mapper');
const uuid = require('uuid-v4');

// models
const User = require('./User');
const Dog = require('../models/Dog');

// libs
const { validateRequiredFields } = require('../lib/common');
const { foundEmail, lostEmail, rescuerInfo } = require('../outbound/email');
const { generateAndUpload } = require('../lib/qrCode');

// schema
const transactionSchema = require('../schemas/transactionSchema');
const { transactionMappings } = require('../schemas/transactionSchema');

// outbound
const openPay = require('../outbound/openPay');

transactionSchema.methods.getInfo = function getInfo() {
  return objectMapper(this, transactionMappings.infoMap);
};

transactionSchema.methods.pay = function pay({ user, body: { saveCard, paymentInfo } }) {
  return user.getOpenPlayInfo({ createIfMissing: true })

  .then(customer => (
    openPay.createCharge(Object.assign(paymentInfo, {
      customerId: customer.id,
      order_id: `tid-${this.id}`,
    }))

    .then(paymentResult => (
      this.update({ paymentId: paymentResult.id, status: 'payment-processed', amount: paymentInfo.amount, qrIdentifier: uuid() })

      .then(() => (
        Promise.resolve(paymentResult)
      ))
    ))

    .then(paymentResult => (
      (saveCard ? Promise.resolve(paymentResult) : openPay.saveCard(Object.assign({
        customerId: customer.id,
      }, paymentInfo)))

      .then(() => (
        User.findByUsername(this.found_id)

        .then(rescuer => (
          generateAndUpload({
            fileName: `qrCodes/${this.id}`,
            data: JSON.stringify({
              identifier: this.qrIdentifier,
              transactionId: this.id,
            }),
          })

          .then(({ url: qrUrl }) => (
            rescuerInfo({ rescuer, owner: user, transaction: this, qrUrl })

            .then(() => (
              Promise.resolve(paymentResult)
            ))
          ))
        ))
      ))
    ))
  ));
};

transactionSchema.methods.reward = function reward({ user, body }) {
  const toUser = (+this.amount - (+this.amount * 0.20)).toFixed(2);
  return user.getOpenPlayInfo({ createIfMissing: true })

  .then(customer => (
    openPay.createTransaction(Object.assign(body, {
      customerId: customer.id,
      amount: toUser,
      orderId: `tid-payout-${this.id}`,
    }))
  ))

  .then(paymentResult => (
    Dog.findById(this.dog_id)
    .then((dog) => (
      Object.assign(dog, {matched: true}).save()
      
      .then(()=> (
         this.update({ status: 'success'})
         .then(() => (
           Promise.resolve(paymentResult)
         ))
      ))
    ))
  ));
};

transactionSchema.methods.refund = function refund({ user }) {
  return openPay.refund({ customerId: user.openPayId, paymentId: this.paymentId, amount: this.amount, description: `Devolucion lostdogs tid-${this.id}` })

  .then(() => (
    this.update({ status: 'failed' })
  ));
};

transactionSchema.methods.update = function update(updateValues) {
  return Object.assign(this, updateValues).save();
};

transactionSchema.statics.found = function found(body, { reporter_id, _id: id }, user) {
  return validateRequiredFields(Object.assign(body, {
    found_id: reporter_id,
    dog_id: id,
  }), transactionMappings.createRequiredFieldsList)

    .then(() => (
      body.paymentInfo ? this.create(objectMapper(Object.assign(body, {
        found_id: reporter_id,
        dog_id: id,
        qrIdentifier: uuid(),
      }), transactionMappings.createMap))

      .then(transaction => (
        transaction.pay({ user, body })

        .then(paymentResult => (
          Promise.all([
            User.findByUsername(transaction.lost_id),
            User.findByUsername(transaction.found_id),
          ])

          .then(([lostUser, reporterUser]) => (
            generateAndUpload({
              fileName: `qrCodes/${this.id}`,
              data: JSON.stringify({
                identifier: this.qrIdentifier,
                transactionId: this.id,
              }),
            })

            .then(({ url: qrUrl }) => (
              foundEmail({
                lostUser,
                qrUrl,
                reporterUser,
                transaction,
              })

              .then(() => (
                Promise.resolve(paymentResult)
              ))
            ))
          ))
        ))
      )) : Promise.reject({
        statusCode: 400,
        code: 'Paymenf information is required',
      })
    ));
};

transactionSchema.statics.lost = function lost(body, { reporter_id, _id: id }) {
  return validateRequiredFields(Object.assign(body, {
    lost_id: reporter_id,
    dog_id: id,
  }), transactionMappings.createRequiredFieldsList)

    .then(createBody => (
      this.create(createBody)

      .then(transaction => (
        Promise.all([
          User.findByUsername(transaction.lost_id),
          User.findByUsername(transaction.found_id),
        ])

        .then(([lostUser, reporterUser]) => (
          lostEmail({
            lostUser,
            reporterUser,
            transaction,
          })
        ))
      ))
    ));
};

module.exports = mongoose.model('transactions', transactionSchema);
