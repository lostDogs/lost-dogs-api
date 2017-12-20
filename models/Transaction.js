// dependencies
const mongoose = require('mongoose');
const objectMapper = require('object-mapper');

// models
const User = require('./User');

// libs
const { validateRequiredFields } = require('../lib/common');
const { foundEmail, lostEmail } = require('../outbound/email');

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
      this.update({ paymentId: paymentResult.id, status: 'payment-processed' })

      .then(() => (
        Promise.resolve(paymentResult)
      ))
    ))

    .then(paymentResult => (
      saveCard ? Promise.resolve(paymentResult) : openPay.saveCard(Object.assign({
        customerId: customer.id,
      }, paymentInfo))

      .then(() => (
        Promise.resolve(paymentResult)
      ))
    ))
  ));
};

transactionSchema.methods.update = function update(updateValues) {
  return Object.assign(this, updateValues).save();
};

transactionSchema.statics.found = function found(body, { reporter_id, _id: id }) {
  return validateRequiredFields(Object.assign(body, {
    found_id: reporter_id,
    dog_id: id,
  }), transactionMappings.createRequiredFieldsList)

    .then(() => (
      this.create(objectMapper(Object.assign(body, {
        found_id: reporter_id,
        dog_id: id,
      }), transactionMappings.createMap))

      .then(transaction => (
        Promise.all([
          User.findByUsername(transaction.lost_id),
          User.findByUsername(transaction.found_id),
        ])

        .then(([lostUser, reporterUser]) => (
          foundEmail({
            lostUser,
            reporterUser,
            transaction,
          })
        ))
      ))
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
