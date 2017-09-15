// dependencies
const fs = require('fs');
const path = require('path');

// libs
const notifications = {
  verifyAccount: {
    metadata: {
      from: process.env.EMAIL_NO_REPLY,
      subject: {
        data: 'Bienvenido a Lostdog.',
      },
    },
  },
};

module.exports.load = (name) => {
  const info = notifications[name];

  return new Promise((resolve, reject) => (
    fs.readFile(path.join(__dirname, `./${name}.html`), (err, fileData) => (
      err ? reject(err) : resolve(Object.assign(info, {
        content: fileData.toString(),
      }))
    ))
  ));
};
