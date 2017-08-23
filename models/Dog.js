// dependencies
const objectMapper = require('object-mapper');
const mongoose = require('mongoose');
const moment = require('moment');
const uuid = require('uuid-v4');

// schema
const dogSchema = require('../schemas/dogSchema');
const dogMappings = require('../schemas/dogSchema').dogMappings;

// libs
const generateArrayFromObject = require('../utils/common').generateArrayFromObject;
const validateRequiredFields = require('../utils/common').validateRequiredFields;
const encryptString = require('../utils/common').encryptString;

// AWS
const s3 = require('../aws/s3')({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  bucketName: process.env.S3_BUCKET,
});

dogSchema.methods.getInfo = function getInfo() {
  return objectMapper(this, dogMappings.infoMap);
};

dogSchema.methods.updateImage = function updateImage(fileType) {
  // encript filename
  return encryptString(`dog-${uuid()}-${Date.now()}`)

    .then(fileName => (
      s3.signObject({
        fileName,

        // mimetype
        fileType,
      })
    ))

    // send back result from validations
    .then(image => (
      new Promise((resolve, reject) => {
        this.image_url = image.url;
        this.save(err => (
          err ? reject({
            statusCode: 500,
            code: 'Error while updating image',
          }) :
          resolve({
            uploadAvatarUrl: image.signedRequest,
            avatar_url: image.url,
          })
        ));
      })
    ));
};

dogSchema.statics.createMap = body => (
  validateRequiredFields(objectMapper(body, dogMappings.createMap), dogMappings.createRequiredFieldsList)

  // get sign object from s3
  .then(createBody => (
    // encript filename
    encryptString(`dog-${uuid()}-${Date.now()}`)

    .then(fileName => (
      s3.signObject({
        fileName,

        // mimetype
        fileType: createBody.fileType,
      })
    ))

    .then(avatar => (
      Promise.resolve(Object.assign(createBody, {
        uploadImageUrl: avatar.signedRequest,
        image_url: avatar.url,
        found_date: moment(createBody.found_date, 'YYYY-MM-DD HH:mm').toDate(),
      }))
    ))
  ))
);

dogSchema.statics.updateMap = (body) => {
  const updateBody = objectMapper(body, dogMappings.createMap);

  return Promise.resolve(Object.assign(updateBody, {
    found_date: updateBody.found_date ? moment(updateBody.found_date, 'YYYY-MM-DD HH:mm').toDate() : null,
  }));
};

dogSchema.pre('save', function preSave(next) {
  this.search = generateArrayFromObject(this, 'kind name'.split(' '));
  this.updated_at = Date.now();

  next();
});

dogSchema.index({
  _id: 1,
});

dogSchema.index({
  name: 1,
});

dogSchema.index({
  reporter_id: 1,
});

module.exports = mongoose.model('dogs', dogSchema);
