// dependencies
const express = require('express');

// static
const router = express.Router();

//midleware
const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });

// Email notification controller
const {startEmail, endEmail} = require('../controllers/sendEmailController')();

router.post('/email/start', userAuthMiddleware, startEmail);
router.post('/email/end', userAuthMiddleware, endEmail);

module.exports = router;