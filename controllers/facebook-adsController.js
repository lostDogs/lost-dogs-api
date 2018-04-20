const fbAds = require('../outbound/facebook-ads');
const Dog = require('../models/Dog');
const { handle } = require('../lib/errorHandler');

function createFbAd({ ad, imgUrl, dogId}) {
  return Promise.all([
    fbAds.updateAdSet(ad.set),
    imgUrl ? Promise.resolve({url: imgUrl}) : fbAds.setImage(ad.img)
  ])
  .then(([adsetRes, adImg]) => {
    return fbAds.createAdCreative(Object.assign(ad.creative, {image_url: adImg.url}, {image_hash: adImg.images.bytes.hash}))

    .then(creative => (Promise.resolve({adsetRes, creative})))
    .catch(err => ( res.status(500).json(err) ))    
  })
};



module.exports = () => {

  const createCampaign = (req, res) => (
    fbAds.createCampaign(req.body)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => { console.log(err); return res.status(500).json(err);})
  );

  const createAd = (req, res) => (
    createFbAd(Object.assign(req.body, {dogId: 'temporaryID123'}))
    .then(resp => ( res.status(201).json(resp) ))
    .catch(err => ( res.status(500).json(err) ))    
  );

  const createAdSet = (req, res) => (
    fbAds.createAdSet(req.body)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
  );

  const getAllCampaign = (req, res) => (
    fbAds.getAllCampaign()
      .then(resp => ( res.status(200).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
  );

  const createAdCreative = (req, res) => (
    fbAds.createAdCreative(req.body)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
  );

    const bindSetCreative = (req, res) => (
    fbAds.bindSetCreative(req.body)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
  );

    const getReachEstimate = (req, res) => {
      req.query.latLng = JSON.parse(req.query.latLng);
      if (req.query.adSetId) {
        return fbAds.getReachEstimate(req.query)
        .then(resp => ( res.status(201).json(Object.assign(resp, {adSetId: req.query.adSetId})) ))
        .catch(err => ( res.status(500).json(err) ))
      }
      return fbAds.createAdSet(req.query)

      .then(adSet => (
        fbAds.getReachEstimate(Object.assign({adSetId: adSet.id}, req.query))

          .then(resp => ( res.status(201).json(Object.assign({adSetId: adSet.id}, resp)) ))
          .catch(err => ( res.status(500).json(err) ))
      ))
      .catch(err => ( res.status(500).json(err) ))
    };

    const setImage = (req, res) => (
      fbAds.setImage(req.body)
        .then(resp => ( res.status(201).json(resp) ))
        .catch(err => ( res.status(500).json(err) ))
    );

  return {
    createCampaign,
    createAdSet,
    getAllCampaign,
    createAdCreative,
    bindSetCreative,
    getReachEstimate,
    setImage,
    createAd
  }
}