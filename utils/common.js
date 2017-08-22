'use strict';

const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');

function select(object, selector) {
  if (object[selector]) return object[selector];

  const path = selector.split('.');
  let obj = Object.assign({}, object);

  for (let i = 0; i < path.length; i += 1) {
    if (obj[path[i]]) {
      obj = obj[path[i]];
    } else return null;
  }

  return obj;
}

module.exports.generateArrayFromObject = (object, fields) => {
  const result = [];

  fields.forEach((field) => {
    if (select(object, field)) {
      result.push(String(select(object, field)).toLowerCase());
    }
  });

  return result;
};

/**
 * Validates the page and pagesize and returns the skip and limit
 * @param  {Number} page, page number.
 * @param  {Number} pageSize, size of the page.
 * @return {Object || Boolean}
 */
module.exports.validatePagination = (page, pageSize) => {
  const pageOkay = validator.isInt(page, {
    min: 0,
    max: 99,
  });

  const pageSizeOkay = validator.isInt(pageSize, {
    min: 0,
    max: 48,
  });

  if (!(pageOkay && pageSizeOkay)) {
    return false;
  }

  return {
    limit: parseInt(pageSize, 10),
    skip: parseInt(pageSize, 10) * parseInt(page, 10),
  };
};

module.exports.encryptString = string => (
  new Promise((resolve, reject) => (
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(string, salt, null, (hashErr, hash) => (
        hashErr ? reject(hashErr) : resolve(hash)
      ));
    })
  ))
);

module.exports.compareToEncryptedString = (enctypted, rawString) => (
  new Promise((resolve, reject) => (
    bcrypt.compare(rawString, enctypted, (err, isMatch) => (
      err ? reject(err) : resolve(isMatch)
    ))
  ))
);

module.exports.validateRequiredFields = (object, requiredFieldsList) => {
  const missingFields = requiredFieldsList.filter(requiredField => (!select(object, requiredField)));

  if (missingFields.length > 0) {
    return Promise.reject({
      statusCode: 400,
      code: `Missing fields in create request: ${missingFields.join(', ')}`,
    });
  }

  return Promise.resolve(object);
};
