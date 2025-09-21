const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetAll } = require('../controllers/RecruitmentController');

router.get('/', VerifyToken, GetAll);

module.exports = router;