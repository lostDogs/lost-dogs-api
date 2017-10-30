// libs
const hugs = require('../utils/common').hugs;
const templates = require('../config/templates');
const ses = require('../aws').ses;

module.exports.verifyAccount = user => (
  templates.load('verifyAccount')

  .then(({ metadata, content }) => (
    ses.sendEmail({
      fromInfo: {
        from: metadata.from,
      },
      content: {
        subject: metadata.subject,
        body: {
          data: hugs(user, content),
          charset: metadata.bodyCharset,
        },
      },
      recipientInfo: {
        to: [user.email],
      },
    })
  ))

  .catch(err => (
    Promise.reject({
      statusCode: 500,
      code: err.code,
    })
  ))
);
