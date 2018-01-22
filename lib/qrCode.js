const qrCode = require('qrcode');

// AWS
const s3 = require('../aws').s3(process.env.S3_BUCKET);

module.exports.generateAndUpload = ({ data, fileName }) => (
  qrCode.toDataURL(data)

  .then(qrUrl => (
    s3.putObject({
      fileName: `${fileName}.jpg`,
      filePath: new Buffer(qrUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
      contentEncoding: 'base64',
      contentType: 'image/jpeg',
    })
  ))
);
