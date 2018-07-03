// dependencies
const express = require('express');
// static
const router = express.Router();

const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });
const {bindSetCreative, getReachEstimate, setImage, deleteAdSet, createCampaign, getAdsetInsight} = require('../controllers/facebook-adsController')();

router.get('/ads', getReachEstimate);
router.delete('/ads/:id', deleteAdSet);

// test routes TODO: delte when fb ads integration is completed >>
router.post('/BindSetCreative', bindSetCreative);
router.post('/SetImage', setImage);
router.post('/campaign', createCampaign);

router.get('/insight/:id', getAdsetInsight)
// << test routes TODO: delte when fb ads integration is completed 

module.exports = router;