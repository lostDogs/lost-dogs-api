const fbAds = require('../outbound/facebook-ads');

const { handle } = require('../lib/errorHandler');

module.exports = () => {

  const createCampaign = (req, res) => (
    fbAds.createCampaign(req.body)
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

    const getReachEstimate = (req, res) => (
    fbAds.getReachEstimate(req.body)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
  );

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
    setImage
  }
}