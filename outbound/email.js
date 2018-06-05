// libs
const hugs = require('../lib/common').hugs;
const templates = require('../config/templates');
const ses = require('../aws').ses;
const moment = require('moment');

module.exports.verifyAccount = user => (
  templates.load('verifyAccount')

  .then(({ from, subject, bodyCharset, content, appName }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject,
        body: {
          data: hugs({metadata: { appName }, user}, content),
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
      statusCode: err.statusCode || 500 ,
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
      statusCode: err.statusCode || 500 ,
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
      statusCode: err.statusCode || 500 ,
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
      statusCode: err.statusCode || 500 ,
      code: err.code,
    })
  ))
);

module.exports.forgotPasswordEmail = ({ user, password }) => (
  templates.load('forgotPassword')

  .then(({ from, subject, bodyCharset, content, appName }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject,
        body: {
          data: hugs({ user, password, metadata: { appName } }, content),
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
      statusCode: err.statusCode || 500 ,
      code: err.code,
    })
  ))
);

module.exports.createFbAdEmail = ({ dog, error, paymentInfo, fbAd, user }) => {
  const mapsUrl = `https://www.google.com/maps/?q=${dog.location.coordinates[1]},${dog.location.coordinates[0]}`;
  const imgUrl = dog.images[0].image_url + '';
  const gender = dog.male + '';
  const templateName = error ? 'createFbAd' : 'dogCreated';

  return templates.load(templateName)

    .then(({ from, subject, bodyCharset, content, appName }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject,
        body: {
          data: hugs({ dog, mapsUrl, imgUrl, gender, error, paymentInfo, fbAd, user, metadata: { appName } }, content),
          charset: bodyCharset,
        },
      },
      recipientInfo: {
        to: [process.env.EMAIL_MONITOR],
      },
    })
  ))

  .catch(err => {
    console.error('error sending template', err);
    return Promise.reject({
      statusCode: err.statusCode || 500 ,
      code: err.code,
    })
  })
};


module.exports.endAdEmail = ({ results, ownerName, reach, ownerEmail, vets, pounds}) => {

  return templates.load('endAd')

    .then(({ from, subject, bodyCharset, content, appName }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject,
        body: {
          data: hugs({ results, ownerName, reach, vets, pounds, metadata: { appName } }, content),
          charset: bodyCharset,
        },
      },
      recipientInfo: {
        to: [ownerEmail],
      },
    })
  ))

  .catch(err => {
    console.error('error sending template', err);
    return Promise.reject({
      statusCode: err.statusCode || 500 ,
      code: err.code,
    })
  })
};

module.exports.startAdEmail = ({ ownerName, ownerEmail, postId, dogName, dogBreed}) => {

  return templates.load('startAd')

    .then(({ from, subject, bodyCharset, content, appName }) => (
    ses.sendEmail({
      fromInfo: {
        from,
      },
      content: {
        subject: {
          data: 'Ya estamos buscando a ' + (dogName || 'tu '+ dogBreed),
        },
        body: {
          data: hugs({  ownerName, postId ,dog: dogName || 'tu '+ dogBreed, metadata: { appName } }, content),
          charset: bodyCharset,
        },
      },
      recipientInfo: {
        to: [ownerEmail],
      },
    })
  ))

  .catch(err => {
    console.error('error sending template', err);
    return Promise.reject({
      statusCode: err.statusCode || 500 ,
      code: err.code,
    })
  })
};

module.exports.seenBy = ({subscriptors, dog, reporter, seenBy, ownerId}) => {
  const lat = seenBy.coordinates[1] + '';
  const long = seenBy.coordinates[0] + '';
  const imgUrl = dog.images[0].image_url + '';
  moment.locale('es');
  seenBy.date = moment(seenBy.date).format('LL');

  return templates.load('seenBy')

    .then(({ from, subject, bodyCharset, content, appName }) => (
      Promise.all(subscriptors.map((subscriptor) => (
        ses.sendEmail({
          fromInfo: {
            from,
          },
          content: {
            subject,
            body: {
              data: hugs({userName: subscriptor.name, imgUrl, reporter, seenBy, lat, long, dogName: dog.name !== 'NA/' ? dog.name :  new RegExp(ownerId, 'g').test(subscriptor._id + '') ? ' tu mascota' : 'la mascota'   ,metadata: { appName, mapsKey: process.env.MAPS_KEY } }, content),
              charset: bodyCharset,
            },
          },
          recipientInfo: {
            to: [subscriptor.email]
          },
        })
      )))
    ))

  .catch(err => {
    console.error('error sending template', err);
    return Promise.reject({
      statusCode: err.statusCode || 500 ,
      code: err.code,
    })
  })
};