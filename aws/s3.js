const AWS = require('aws-sdk');

module.exports = ({ credentials, bucketName }) => {
  const s3 = new AWS.S3(credentials);

  const signObject = ({ fileName, fileType }) => (
    new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read',
      }, (err, data) => (
        err ? reject({
          statusCode: 500,
          code: err.code,
        }) : resolve({
          signedRequest: data,
          url: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
        })
      ));
    })
  );

  const updateBucketCors = () => (
    new Promise((resolve, reject) => {
      s3.putBucketCors({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [{
            AllowedHeaders: ['*'],
            AllowedMethods: ['PUT', 'POST', 'GET'],
            AllowedOrigins: ['*'],
            MaxAgeSeconds: 3000,
          }],
        },
      }, (err, data) => (
        err ? reject(err) : resolve(data)
      ));
    })
  );

  const createBucket = () => (
    new Promise((resolve, reject) => {
      s3.createBucket({
        Bucket: bucketName,
        ACL: 'public-read',
      }, (err, data) => (
        err ? reject(err) : resolve(data)
      ));
    })
  );

  const getBucketLocation = () => (
    new Promise((resolve, reject) => {
      s3.getBucketLocation({
        Bucket: bucketName,
      }, (err, data) => (
        err ? reject(err) : resolve(data)
      ));
    })
  );

  return {
    updateBucketCors,
    createBucket,
    getBucketLocation,
    signObject,
  };
};
