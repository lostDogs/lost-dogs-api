// dependencies
const express = require('express');

// static
const router = express.Router();

// dogs controller
const { search, retrieve, create, update, deleteItem, found, lost } = require('../controllers/dogController')();
const annonAuthMiddleware = require('../lib/token').middleware({ reqUser: false });
const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });

// Public
router.get('/', annonAuthMiddleware, search);
router.get('/:id', annonAuthMiddleware, retrieve);

// CRUD
router.post('/', userAuthMiddleware, create);
router.put('/:id', userAuthMiddleware, update);
router.delete('/:id', userAuthMiddleware, deleteItem);

// reporting routes
router.post('/:id/found', userAuthMiddleware, found);
router.post('/:id/lost', userAuthMiddleware, lost);

// Extras
// router.put('/:id/image', userAuthMiddleware, controller.updateImage);

module.exports = router;
