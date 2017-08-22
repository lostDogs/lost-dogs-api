const express = require('express');

const router = express.Router();

// users controller
const controller = require('../controllers/userController')();
const authMiddleware = require('../utils/token').middleware;

router.post('/', controller.create);
router.post('/login', controller.login);

router.all('*', authMiddleware);
router.get('/:username', controller.retrieve);
router.put('/:username', controller.update);
router.delete('/:username', controller.deleteItem);

module.exports = router;
