const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { ValidateForm } = require('../middlewares/EmployeeValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetEmployment } = require('../controllers/EmploymentController');

router.get('/', VerifyToken, GetEmployment);

module.exports = router;