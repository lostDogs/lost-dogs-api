// dependencies
const fetch = require('node-fetch');
//extas
const captchaUrl = `${process.env.CAPTCHA_URL}?secret=${process.env.CAPTCHA_SECRET}`;


module.exports.verifyCaptcha = captchaVar => (
  fetch(`${captchaUrl}&response=${captchaVar}`, {
    method: 'POST',
  }).then(response => (
    response.json()

    .then((jsonResponse) => {
      if (response.ok) {
        return Promise.resolve(jsonResponse);
      }
      return Promise.reject({
        statusCode: jsonResponse.http_code,
        code: jsonResponse.description,
      });
    }, err => (
      Promise.reject({
        statusCode: 500,
        error: err.message,
      })
    ))
  ))
);