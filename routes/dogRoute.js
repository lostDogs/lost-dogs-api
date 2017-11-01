// dependencies
const express = require('express');

// static
const router = express.Router();

// dogs controller
const { search, retrieve, create, update, deleteItem } = require('../controllers/dogController')();
const annonAuthMiddleware = require('../lib/token').middleware({ reqUser: false });
const userAuthMiddleware = require('../lib/token').middleware({ reqUser: true });

// Public
router.get('/', annonAuthMiddleware, search);
router.get('/:id', annonAuthMiddleware, retrieve);

// CRUD
router.post('/', userAuthMiddleware, create);
router.put('/:id', userAuthMiddleware, update);
router.delete('/:id', userAuthMiddleware, deleteItem);

// Extras
// router.put('/:id/image', userAuthMiddleware, controller.updateImage);

module.exports = router;
