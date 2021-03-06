const dotenv = require('dotenv');

// load environment options
dotenv.load({ path: '.env' });

const s3 = require('../../../aws/s3')({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  bucketName: process.env.S3_BUCKET,
});

s3.getBucketLocation()

  .then(bucketInfo => (
    console.log(`BucketInfo: ${JSON.stringify(bucketInfo)}`)
  ))

  .catch((err) => {
    console.log('AWS Error:', JSON.stringify(err));
  });
