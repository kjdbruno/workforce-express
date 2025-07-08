const express = require('express');
const router = express.Router();

const { getAllSexes } = require('../controllers/SexController');

router.get('/', getAllSexes);

module.exports = router;