// dependencies
const express = require('express');

// static
const router = express.Router();

// dogs controller
const controller = require('../controllers/dogController')();
const annonAuthMiddleware = require('../utils/token').middleware({ reqUser: false });
const userAuthMiddleware = require('../utils/token').middleware({ reqUser: true });

// Public
router.get('/', annonAuthMiddleware, controller.search);
router.get('/:id', annonAuthMiddleware, controller.retrieve);

// CRUD
router.post('/', userAuthMiddleware, controller.create);
router.put('/:id', userAuthMiddleware, controller.update);
router.delete('/:id', userAuthMiddleware, controller.deleteItem);

// Extras
router.put('/:id/image', userAuthMiddleware, controller.updateImage);

module.exports = router;
