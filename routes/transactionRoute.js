// dependencies
const express = require('express');

// static
const router = express.Router();

// dogs controller
const { retrieve, pay, deleteItem, reward, refund } = require('../controllers/transactionController')();
const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });

// CRUD
router.get('/:id', userAuthMiddleware, retrieve);
router.delete('/:id', userAuthMiddleware, deleteItem);

router.post('/:id/pay', userAuthMiddleware, pay);
router.post('/:id/reward/:identifier', userAuthMiddleware, reward);
router.delete('/:id/refund', userAuthMiddleware, refund);

module.exports = router;
