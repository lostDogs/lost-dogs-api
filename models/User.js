// dependencies
const objectMapper = require('object-mapper');
const mongoose = require('mongoose');
const uuid = require('uuid-v4');

// schema
const userSchema = require('../schemas/userSchema');
const userMappings = require('../schemas/userSchema').userMappings;

// libs
const generateArrayFromObject = require('../utils/common').generateArrayFromObject;
const validateRequiredFields = require('../utils/common').validateRequiredFields;
const encryptString = require('../utils/common').encryptString;
const compareToEncryptedString = require('../utils/common').compareToEncryptedString;

// AWS
const s3 = require('../aws/s3')({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  bucketName: process.env.S3_BUCKET,
});

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

userSchema.methods.getInfo = function getInfo() {
  return objectMapper(this, userMappings.infoMap);
};

userSchema.statics.validateToken = function validateToken(jwtPayload) {
  return new Promise((resolve, reject) => {
    this.findOne({
      username: jwtPayload.username,
    }, (err, user) => {
      if (err || !user) {
        return reject({
          statusCode: 401,
          code: 'User not found',
        });
      }

      return compareToEncryptedString(user.token, jwtPayload.token)

        .then(() => (
          resolve(user)
        ));
    });
  });
};

userSchema.statics.login = function login(query) {
  return new Promise((resolve, reject) => {
    this.findOne({
      username: query.username,
    }, (err, user) => {
      if (err || !user) {
        return reject({
          statusCode: 401,
          code: 'User not found',
        });
      }

      return compareToEncryptedString(user.password, query.password)

        .then(() => (
          resolve(user)
        ));
    });
  });
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

userSchema.index({
  _id: 1,
});

userSchema.index({
  email: 1,
});

userSchema.index({
  username: 1,
});

userSchema.index({
  email: 1,
  username: 1,
});

module.exports = mongoose.model('users', userSchema);
