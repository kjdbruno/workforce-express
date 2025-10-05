const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/RecruitmentValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetAll, Create } = require('../controllers/RecruitmentController');

router.get('/', VerifyToken, GetAll);
router.post('/', VerifyToken, ValidateForm(), Create);

module.exports = router;