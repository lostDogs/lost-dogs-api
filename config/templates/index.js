// dependencies
const fs = require('fs');
const path = require('path');

// libs
const notifications = {
  common: {
    appName: process.env.APP_NAME,
    from: process.env.EMAIL_NO_REPLY,
    subject: {
      data: 'Notifiacion Lost Dog.',
    },
  },
  verifyAccount: {
    subject: {
      data: 'Bienvenido a Lost Dog.',
    },
  },
  forgotPassword: {
    subject: {
      data: 'Nueva contraseña',
    },
  },
};

module.exports.load = name => (
  new Promise((resolve, reject) => (
    fs.readFile(path.join(__dirname, `./${name}.html`), (err, fileData) => (
      err ? reject(err) : resolve(Object.assign({}, notifications.common, notifications[name], {
        content: fileData.toString(),
      }))
    ))
  ))
);
