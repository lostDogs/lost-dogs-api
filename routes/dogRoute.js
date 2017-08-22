const express = require('express');

const router = express.Router();

// dogs controller
const controller = require('../controllers/dogController')();
const authMiddleware = require('../utils/token').middleware;

router.all('*', authMiddleware);
router.post('/', controller.create);
router.get('/:id', controller.retrieve);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteItem);
router.get('/', controller.search);

module.exports = router;
