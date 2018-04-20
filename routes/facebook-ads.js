// dependencies
const express = require('express');
// static
const router = express.Router();

const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });
const {createCampaign, createAdSet, getAllCampaign, createAdCreative, bindSetCreative, getReachEstimate, setImage, createAd} = require('../controllers/facebook-adsController')();

router.get('/ads', getReachEstimate);
router.post('/ads', createAd)

// test routes TODO: delte when fb ads integration is completed >>
router.post('/Campaign', createCampaign);
router.get('/Campaign', getAllCampaign);
router.post('/Adset', createAdSet);
router.post('/Adcreative', createAdCreative);
router.post('/BindSetCreative', bindSetCreative);
router.post('/ReachEstimate', getReachEstimate);
router.post('/SetImage', setImage);
// << test routes TODO: delte when fb ads integration is completed 

module.exports = router;