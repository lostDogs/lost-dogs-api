// libs
const hugs = require('../utils/common').hugs;
const templates = require('../config/templates');
const ses = require('../aws').ses;

module.exports.verifyAccount = user => (
  templates.load('verifyAccount')

  .then(template => (
    ses.sendEmail({
      fromInfo: {
        from: template.metadata.from,
      },
      content: {
        subject: template.metadata.subject,
        body: {
          data: hugs(user, template.content),
          charset: template.metadata.bodyCharset,
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
