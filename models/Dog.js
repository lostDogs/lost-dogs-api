// dependencies
const objectMapper = require('object-mapper');
const mongoose = require('mongoose');
const moment = require('moment');
const uuid = require('uuid-v4');

// schema
const dogSchema = require('../schemas/dogSchema');
const { dogMappings } = require('../schemas/dogSchema');

// libs
const { generateArrayFromObject, validateRequiredFields, encryptString } = require('../lib/common');

// AWS
const s3 = require('../aws/').s3(process.env.S3_BUCKET);

// static values
const strictFields = 'male size_id reporter_id pattern_id accessories_id lost reward'.split(' ');

// outbound
const openPay = require('../outbound/openPay');
const fbAds = require('../outbound/facebook-ads');

dogSchema.methods.getInfo = function getInfo() {
  return objectMapper(this, dogMappings.infoMap);
};

dogSchema.methods.addPayment = function addPayment({ paymentInfo, user, saveCard }) {
  return user.getOpenPlayInfo({ createIfMissing: true })

  .then(customer => (
    openPay.createCharge(Object.assign(paymentInfo, {
      customerId: customer.id,
      order_id: `tid-${this.id}`,
    }))

    .then(paymentResult => (
      this.update({ paymentId: paymentResult.id, status: 'payment-processed', amount: paymentInfo.amount, qrIdentifier: uuid() })

      .then(() => (
        Promise.resolve(paymentResult)
      ))
    ))

    .then(paymentResult => (
      (!saveCard ? Promise.resolve(paymentResult) : openPay.saveCard(Object.assign({
        customerId: customer.id,
      }, paymentInfo)))

      .then(() => (
        Promise.resolve(paymentResult)
      ))
    ))
  ));
};

dogSchema.methods.createFbAd = function createFbAd({ ad, dogId, userEmail}) {
  ad.set.latLng = ad.set.latLng ? JSON.parse(ad.set.latLng) : undefined;
  return Promise.all([
    (ad.set.adSetId ? fbAds.updateAdSet(ad.set) : fbAds.createAdSet(Object.assign(ad.set, {name: `${userEmail} t: ${(new Date()).toLocaleString()}` }))),
    fbAds.setImage(ad.img)
  ])

  .then(([setResp, imgResp]) => (
    fbAds.createAdCreative(Object.assign(ad.creative, {image_hash: imgResp.images.bytes.hash, dogId, adSet: ad.set.adSetId || setResp.id}))

    .then(creative => (
      fbAds.bindSetCreative({adName: dogId, adSetId: ad.set.adSetId || setResp.id, adCreativeId: creative.id})

      .then(adBind => (
        Promise.resolve({img: {url: imgResp.images.bytes.url, hash: imgResp.images.bytes.hash}, creativeid: creative.id, adId: adBind.id, adSetId: ad.set.adSetId || setResp.id})
      ))
    ))
  ))
};


dogSchema.methods.updateImage = function updateImage(fileType) {
  // encript filename
  return encryptString(`dog-${uuid()}-${Date.now()}`)

    .then(fileName => (
      s3.signObject({
        fileName,

        // mimetype
        fileType,
      })
    ))

    // send back result from validations
    .then(({ url, signedRequest }) => {
      this.image_url = url;
      this.save()

        .then(() => (
          Promise.resolve({
            uploadAvatarUrl: signedRequest,
            avatar_url: url,
          })
        ), () => ({
          statusCode: 500,
          code: 'Error while updating image',
        }));
    });
};

dogSchema.statics.extraFields = (query) => {
  const terms = (strictFields || []).reduce((acc, term) => (
    query[term] ? acc.concat([{
      [term]: query[term],
    }]) : acc
  ), []);

  if (query.fromDate && query.toDate) {
    terms.push({
      created_at: {
        $gte: moment(query.fromDate).startOf('day').valueOf(),
        $lt: moment(query.toDate).endOf('day').valueOf(),
      },
    });
  }

  if (query.kind) {
    terms.push({
      kind: { $in: query.kind.split(',').map((term, index) => (new RegExp(`^${term},|,${term},|^${term}$|,${term}$`)))},
    });
  }

  if (query.color) {
    terms.push({
      color: { $in: query.color.split(',').map(term => (new RegExp(term)))},
    });
  }

  if (query.date) {
    terms.push({
      created_at: {
        $gte: moment(query.date).startOf('day').valueOf(),
        $lt: moment(query.date).endOf('day').valueOf(),
      },
    });
  }

  if(query.matched) {
    terms.push({
      matched: query.matched === 'true'
    });
  }

  return terms.concat(query.location && query.maxDistance ? [{
    location: {
      $near: {
        $maxDistance: query.maxDistance,
        $geometry: { type: 'Point', coordinates: query.location.split(',').map(data => +data) },
      },
    },
  }] : []);
};

dogSchema.statics.createMap = body => (
  validateRequiredFields(objectMapper(body, dogMappings.createMap), dogMappings.createRequiredFieldsList)

  // get sign object from s3
  .then(createBody => (
    // encript filename
    Promise.all(createBody.images.map(image => (
      encryptString(`dog-${body.reporter_id}-${uuid()}-${Date.now()}`)

      .then(fileName => (
        s3.signObject({
          fileName: `dogs/${fileName}`,

          // mimetype
          fileType: image,
        })
      ))
    )))

    .then(avatars => (
      Promise.resolve(Object.assign(createBody, {
        images: avatars.map(({ signedRequest, url }) => ({
          uploadImageUrl: signedRequest,
          image_url: url,
        })),
      }))
    ))
  ))
);

dogSchema.statics.updateMap = (body) => {
  const updateBody = objectMapper(body, dogMappings.createMap);
  return Promise.resolve(body);
};

dogSchema.pre('save', function preSave(next) {
  this.search = generateArrayFromObject(this, 'kind name'.split(' '));
  this.updated_at = Date.now();

  next();
});

module.exports = mongoose.model('dogs', dogSchema);
