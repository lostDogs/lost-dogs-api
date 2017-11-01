// dependencies
const bcrypt = require('bcrypt-nodejs');

const select = (object, selector) => (
  selector.split('.').reduce((acc, current) => (
    acc && acc[current] ? acc[current] : null
  ), object)
);

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
module.exports.validatePagination = ({ page = 0, pageSize = 12 }) => (
  !((+page >= 0 && +page <= 99) && (+pageSize >= 0 && +pageSize <= 48)) ? Promise.reject({
    statusCode: 400,
    code: 'Invalid pagination.',
  }) : Promise.resolve({
    limit: parseInt(pageSize, 10),
    skip: parseInt(pageSize, 10) * parseInt(page, 10),
  })
);

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

module.exports.hugs = (content, template) => (
  template.match(/{{(.*?)}}/g) ?
  template.match(/{{(.*?)}}/g).map(placeholder => placeholder.replace(/{+|}+/g, '')).forEach((placeholder) => {
    const value = select(content, placeholder);
    template = template.replace(`{{${placeholder}}}`, typeof value !== 'undefined' && value !== null ? select(content, placeholder) : '');
  }) : template
);
