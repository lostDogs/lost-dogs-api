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

s3.createBucket()

  .then((bucket) => {
    console.log('Bucket data: ', JSON.stringify(bucket));

    return s3.updateBucketCors();
  })

  .then((corsData) => {
    console.log('Cors Data', JSON.stringify(corsData));
    console.log('Success!! Created and Updated bucket...');
  })

  .catch((err) => {
    console.log('AWS Error:', JSON.stringify(err));
  });
