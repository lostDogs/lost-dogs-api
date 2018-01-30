// libs
const hugs = require('../lib/common').hugs;
const templates = require('../config/templates');
const ses = require('../aws').ses;

module.exports.verifyAccount = user => (
  templates.load('verifyAccount')

  .then(({ from, subject, bodyCharset, content }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject,
        body: {
          data: hugs(user, content),
          charset: bodyCharset,
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

module.exports.rescuerInfo = ({ rescuer, transaction, qrUrl, owner }) => (
  templates.load('foundEmailToOwner')

  .then(({ from, subject, bodyCharset, content, appName }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject,
        body: {
          data: hugs({ owner, qrUrl, metadata: { appName }, transaction, reporter: rescuer }, content),
          charset: bodyCharset,
        },
      },
      recipientInfo: {
        to: [owner.email],
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

module.exports.foundEmail = ({ lostUser, qrUrl, reporterUser, transaction }) => (
  templates.load('foundEmailToReporter')

  .then((reporter) => (
    ses.sendEmail({
      fromInfo: {
        from: reporter.from,
      },
      content: {
        subject: reporter.subject,
        body: {
          data: hugs({ reporter: reporterUser, metadata: reporter, transaction }, reporter.content),
          charset: reporter.bodyCharset,
        },
      },
      recipientInfo: {
        to: [reporterUser.email],
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

module.exports.lostEmail = ({ lostUser, reporterUser, transaction }) => (
  Promise.all([templates.load('lostEmailToOwner'), templates.load('lostEmailToReporter')])

  .then(([owner, reporter]) => (
    Promise.all([
      ses.sendEmail({
        fromInfo: {
          from: owner.from,
        },
        content: {
          subject: owner.subject,
          body: {
            data: hugs({ owner: lostUser, metadata: owner, transaction }, owner.content),
            charset: owner.bodyCharset,
          },
        },
        recipientInfo: {
          to: [lostUser.email],
        },
      }),
      ses.sendEmail({
        fromInfo: {
          from: reporter.from,
        },
        content: {
          subject: reporter.subject,
          body: {
            data: hugs({ reporter: reporterUser, metadata: reporter, transaction }, reporter.content),
            charset: reporter.bodyCharset,
          },
        },
        recipientInfo: {
          to: [reporterUser.email],
        },
      }),
    ])
  ))

  .catch(err => (
    Promise.reject({
      statusCode: 500,
      code: err.code,
    })
  ))
);

module.exports.forgotPasswordEmail = ({ user, password }) => (
  templates.load('forgotPassword')

  .then(({ from, subject, bodyCharset, content }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject,
        body: {
          data: hugs({ user, password }, content),
          charset: bodyCharset,
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
