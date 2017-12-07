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

userSchema.methods.getInfo = function getInfo() {
  return objectMapper(this, userMappings.infoMap);
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
    }) : compareToEncryptedString(user.token, token)

      .then(() => (
        Promise.resolve(user)
      ))
    ));
};

userSchema.statics.login = function login({ username, password }) {
  return this.findOne({ username })

    .then(user => (!user ? Promise.reject({
      statusCode: 401,
      code: 'User not found',
    }) : compareToEncryptedString(user.password, password)

      .then(() => (
        Promise.resolve(user)
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
