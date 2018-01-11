// dependencies
const express = require('express');

// static
const router = express.Router();

// users controller
const {
  create,
  login,
  retrieve,
  update,
  deleteItem,
  updateAvatar,
  getPaymentOptions,
  createPaymentOption,
  createBankAccount,
  getBankAccounts,
  forgotPassword,
  changePassword,
} = require('../controllers/userController')();
const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });
const annonAuthMiddleware = require('../lib/token').middleware({ reqUser: false });

// Session managment
router.post('/', create);
router.post('/login', login);

// CRUD
router.get('/:username/profile', userAuthMiddleware, retrieve);
router.put('/:username', userAuthMiddleware, update);
router.delete('/:username', userAuthMiddleware, deleteItem);

// Extras
router.put('/:username/avatar', userAuthMiddleware, updateAvatar);
router.put('/:username/changePassword', userAuthMiddleware, changePassword);

// Payment options
router.get('/:username/paymentOptions', userAuthMiddleware, getPaymentOptions);
router.post('/:username/paymentOptions', userAuthMiddleware, createPaymentOption);
router.post('/:username/bankAccount', userAuthMiddleware, createBankAccount);
router.get('/:username/bankAccount', userAuthMiddleware, getBankAccounts);

// annon
router.post('/:username/forgotPassword', annonAuthMiddleware, forgotPassword);

module.exports = router;
