// dependencies
const express = require('express');

// static
const router = express.Router();

// Email notification controller
const { bounces, complaints } = require('../controllers/emailNotifyController')();

router.post('/bounces', bounces);
router.post('/complaints', complaints);

module.exports = router;