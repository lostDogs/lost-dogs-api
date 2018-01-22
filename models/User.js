// dependencies
const objectMapper = require('object-mapper');
const mongoose = require('mongoose');
const uuid = require('uuid-v4');

// schema
const userSchema = require('../schemas/userSchema');
const { userMappings } = require('../schemas/userSchema');

// libs
const { generateArrayFromObject, validateRequiredFields, encryptString, compareToEncryptedString } = require('../lib/common');

// AWS
const s3 = require('../aws').s3(process.env.S3_BUCKET);

// outbound
const openPay = require('../outbound/openPay');

userSchema.methods.getInfo = function getInfo() {
  return objectMapper(this, userMappings.infoMap);
};

userSchema.methods.getOpenPlayInfo = function getOpenPlayInfo({ createIfMissing = false } = {}) {
  return this.openPayId ? openPay.getCustomer({ customerId: this.openPayId }) :

  createIfMissing ? openPay.createCustomer(this)

  .then(customer => (
    this.update({
      openPayId: customer.id,
    })

    .then(() => (
      Promise.resolve(customer)
    ))
  )) :

  Promise.reject({
    statusCode: 404,
    code: 'payment information not found.',
  });
};

userSchema.methods.generateNewPassword = function generateNewPassword({ usePassword } = {}) {
  const newPassword = usePassword || Math.random().toString(36).substr(2, 6);

  return encryptString(newPassword)

  .then(password => (
    this.update({ password })
  ))

  .then(() => (
    Promise.resolve(newPassword)
  ));
};

userSchema.methods.replacePassword = function replacePassword({ newPassword, confirmPassword, oldPassword }) {
  return newPassword !== confirmPassword ? Promise.reject({
    statusCode: 400,
    code: 'Password mismatch',
  }) : compareToEncryptedString(this.password, oldPassword)

  .then(isMatch => {
    console.log('wut', isMatch, oldPassword);
    return !isMatch ? Promise.reject({
      statusCode: 401,
      code: 'Wrong user or password',
    }) : this.generateNewPassword({ usePassword: newPassword });
  });
};

userSchema.methods.createCustomer = function createCustomer({ customerInfo }) {
  return openPay.createCustomer(Object.assign(customerInfo, { _id: this.id }));
};

userSchema.methods.paymentOptions = function paymentOptions() {
  return Promise.all([this.getOpenPlayInfo(), openPay.getCads({ customerId: this.openPayId })])

  .then(([customer, cards]) => (
    Promise.resolve({ customer, cards })
  ));
};

userSchema.methods.addPaymentOption = function addPaymentOption(body) {
  return this.getOpenPlayInfo({ createIfMissing: true })

  .then(customer => (
    openPay.saveCard(Object.assign({
      customerId: customer.id,
    }, body))

    .then(cardResult => (
      Promise.resolve(cardResult)
    ))
  ));
};

userSchema.methods.bankAccounts = function bankAccounts() {
  return Promise.all([this.getOpenPlayInfo(), openPay.getBankAccounts({ customerId: this.openPayId })])

  .then(([customer, accounts]) => (
    Promise.resolve({ customer, accounts })
  ));
};

userSchema.methods.addBankAccount = function addBankAccount(body) {
  return this.getOpenPlayInfo({ createIfMissing: true })

  .then(customer => (
    openPay.saveBankAccount(Object.assign({
      customerId: customer.id,
    }, body))

    .then(bankAccount => (
      Promise.resolve(bankAccount)
    ))
  ));
};

userSchema.methods.updateAvatar = function updateAvatar(fileType) {
  // encript filename
  return encryptString(`${this.username}-${uuid()}-${Date.now()}`)

    .then(fileName => (
      s3.signObject({
        fileName,

        // mimetype
        fileType,
      })
    ))

    // send back result from validations
    .then(({ url, signedRequest }) => {
      this.avatar_url = url;
      this.save()

        .then(() => (
          Promise.resolve({
            uploadAvatarUrl: signedRequest,
            avatar_url: url,
          })
        ), () => ({
          statusCode: 500,
          code: 'Error while updating image',
        }));
    });
};

userSchema.methods.update = function update(updateValues) {
  return Object.assign(this, updateValues).save();
};

userSchema.statics.findByUsername = function findByUsername(username) {
  return this.findOne({ username });
};

userSchema.statics.createMap = body => (
  validateRequiredFields(objectMapper(body, userMappings.createMap), userMappings.createRequiredFieldsList)

  // validate password matching
  .then(createBody => (
    createBody.password === createBody.confirm_password ? Promise.resolve(createBody) : Promise.reject({
      statusCode: 400,
      code: 'Password missmatch',
    })
  ))

  // get sign object from s3
  .then(createBody => (
    // encript filename
    encryptString(`${createBody.username}-${uuid()}-${Date.now()}`)

    .then(fileName => (
      s3.signObject({
        fileName,

        // mimetype
        fileType: createBody.fileType,
      })
    ))

    // send back result from validations
    .then(avatar => (
      Promise.resolve({
        uploadAvatarUrl: avatar.signedRequest,
        createBody: Object.assign(createBody, {
          avatar_url: avatar.url,
        }),
      })
    ))
  ))
);

userSchema.statics.updateMap = body => (
  Promise.resolve(objectMapper(body, userMappings.updateMap))
);

userSchema.statics.validateToken = function validateToken({ username, token }) {
  return this.findOne({ username })

    .then(user => (!user ? Promise.reject({
      statusCode: 401,
      code: 'User not found',
    }) : user.token === token ? Promise.resolve(user) :
    Promise.reject({
      statusCode: 401,
      code: 'Wrong user or password',
    })
  ));
};

userSchema.statics.login = function login({ username, password }) {
  return this.findOne({ username })

    .then(user => (!user ? Promise.reject({
      statusCode: 401,
      code: 'User not found',
    }) : compareToEncryptedString(user.password, password)

      .then(isMatch => (
        isMatch ? Promise.resolve(user) : Promise.reject({
          statusCode: 401,
          code: 'Wrong user or password',
        })
      ))
    ));
};

userSchema.pre('save', function preSave(next) {
  this.search = generateArrayFromObject(this, 'email username'.split(' '));
  this.updated_at = Date.now();

  if (this.isNew) {
    return Promise

      .all([
        encryptString(this.password),
        encryptString(uuid()),
      ])

      .then(([password, token]) => {
        this.token = token;
        this.password = password;
        next();
      });
  }

  return next();
});

module.exports = mongoose.model('users', userSchema);
