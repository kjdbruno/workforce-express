const express = require('express');
const router = express.Router();

const { GetAllUsers } = require('../controllers/UserController');

router.get('/', GetAllUsers);
// router.post('/', cre);

module.exports = router;