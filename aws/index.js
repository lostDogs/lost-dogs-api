// libs
const s3 = require('./s3');
const ses = require('./ses');

// static
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
};

module.exports = {
  s3(bucketName) {
    return s3({
      credentials,
      bucketName,
    });
  },
  ses: ses({
    credentials: Object.assign(credentials, {
      region: process.env.EMAIL_REGION,
    }),
  }),
};
