const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/CompanyValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { ScanBiometric, ScanFace, GetLeaveType, CreateLeave } = require('../controllers/BiometricController');

router.post('/biometric', ScanBiometric);
router.post('/face', ScanFace);
router.post('/leave', CreateLeave);

router.get('/option/leavetype', GetLeaveType);

module.exports = router;