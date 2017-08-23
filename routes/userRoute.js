// dependencies
const express = require('express');

// static
const router = express.Router();

// users controller
const controller = require('../controllers/userController')();
const userAuthMiddleware = require('../utils/token').middleware({ reqUser: true });

// Session managment
router.post('/', controller.create);
router.post('/login', controller.login);

// CRUD
router.get('/:username/profile', userAuthMiddleware, controller.retrieve);
router.put('/:username', userAuthMiddleware, controller.update);
router.delete('/:username', userAuthMiddleware, controller.deleteItem);

// Extras
router.put('/:username/avatar', userAuthMiddleware, controller.updateAvatar);

module.exports = router;
