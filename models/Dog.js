// dependencies
const objectMapper = require('object-mapper');
const mongoose = require('mongoose');
const moment = require('moment');
const uuid = require('uuid-v4');

// schema
const dogSchema = require('../schemas/dogSchema');
const { dogMappings } = require('../schemas/dogSchema');

// libs
const { generateArrayFromObject, validateRequiredFields, encryptString } = require('../utils/common');

// AWS
const s3 = require('../aws/s3')(process.env.S3_BUCKET);

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
    .then(({ url, signedRequest }) => {
      this.image_url = url;
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
