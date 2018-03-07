// dependencies
const express = require('express');

// static
const router = express.Router();
const bodyParser = require('body-parser');

// Email notification controller
const { bounces, complaints } = require('../controllers/emailNotifyController')();

router.post('/bounces', bodyParser.text(), bounces);
router.post('/complaints', bodyParser.text(), complaints);

module.exports = router;