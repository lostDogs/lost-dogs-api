const fbAds = require('../outbound/facebook-ads');
const Dog = require('../models/Dog');
const { handle } = require('../lib/errorHandler');


module.exports = () => {

    const bindSetCreative = (req, res) => (
    fbAds.bindSetCreative(req.body)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
    );

    const createCampaign = (req, res) => (
    fbAds.createCampaign(req.body)
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
    
    const deleteAdSet = (req, res) => {
      console.log('req', req.params);
      return fbAds.deleteAdSet(req.params.id)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
    };

    const getAdsetInsight = (req, res) => (
      fbAds.getAdsetInsight(req.params.id)
      .then(resp => ( res.status(201).json(resp) ))
      .catch(err => ( res.status(500).json(err) ))
    );

  return {
    bindSetCreative,
    getReachEstimate,
    setImage,
    deleteAdSet,
    createCampaign,
    getAdsetInsight
  }
}