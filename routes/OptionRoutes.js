const express = require('express');
const router = express.Router();

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetOptions } = require('../controllers/OptionController');

router.get('/', VerifyToken, GetOptions);

module.exports = router;