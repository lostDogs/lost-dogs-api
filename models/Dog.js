const objectMapper = require('object-mapper');
const mongoose = require('mongoose');
const moment = require('moment');

// schema
const dogSchema = require('../schemas/dogSchema');
const dogMappings = require('../schemas/dogSchema').dogMappings;

const generateArrayFromObject = require('../utils/common').generateArrayFromObject;
const validateRequiredFields = require('../utils/common').validateRequiredFields;

dogSchema.statics.createMap = body => (
  validateRequiredFields(objectMapper(body, dogMappings.createMap), dogMappings.createRequiredFieldsList)

  .then(createBody => (
    Promise.resolve(Object.assign(createBody, {
      found_date: moment(createBody.found_date, 'YYYY-MM-DD HH:mm').toDate(),
    }))
  ))
);

dogSchema.statics.updateMap = (body) => {
  const updateBody = objectMapper(body, dogMappings.createMap);
  return Promise.resolve(Object.assign(updateBody, {
    found_date: updateBody.found_date ? moment(updateBody.found_date, 'YYYY-MM-DD HH:mm').toDate() : null,
  }));
};

dogSchema.methods.getInfo = function getInfo() {
  const objTmp = objectMapper(this, dogMappings.infoMap);
  return objTmp;
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
