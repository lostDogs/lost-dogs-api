// dependencies
const express = require('express');

// static
const router = express.Router();

// dogs controller
const { retrieve, pay, deleteItem } = require('../controllers/transactionController')();
const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });

// CRUD
router.get('/:id', userAuthMiddleware, retrieve);
router.delete('/:id', userAuthMiddleware, deleteItem);

router.post('/:id/pay', userAuthMiddleware, pay);

module.exports = router;
