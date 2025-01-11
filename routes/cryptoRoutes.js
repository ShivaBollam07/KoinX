const express = require('express');
const cryptoController = require('../controllers/cryptoController');

const router = express.Router();

router.get('/stats', cryptoController.getStats);
router.get('/deviation', cryptoController.getDeviation);

module.exports = router;
