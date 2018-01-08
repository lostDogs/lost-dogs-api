// dependencies
const express = require('express');

// static
const router = express.Router();

// users controller
const { create, login, retrieve, update, deleteItem, updateAvatar, getPaymentOptions, createPaymentOption, createBankAccount, getBankAccounts } = require('../controllers/userController')();
const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });

// Session managment
router.post('/', create);
router.post('/login', login);

// CRUD
router.get('/:username/profile', userAuthMiddleware, retrieve);
router.put('/:username', userAuthMiddleware, update);
router.delete('/:username', userAuthMiddleware, deleteItem);

// Extras
router.put('/:username/avatar', userAuthMiddleware, updateAvatar);

// Payment options
router.get('/:username/paymentOptions', userAuthMiddleware, getPaymentOptions);
router.post('/:username/paymentOptions', userAuthMiddleware, createPaymentOption);
router.post('/:username/bankAccount', userAuthMiddleware, createBankAccount);
router.get('/:username/bankAccount', userAuthMiddleware, getBankAccounts);

module.exports = router;
