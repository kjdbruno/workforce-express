const express = require('express');
const router = express.Router();

const UploadLog = require("../middlewares/UploadLog");

const { ValidateForm } = require('../middlewares/CompanyValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { ScanBiometric, ScanFace, GetLeaveType, CreateLeave, TimeIn } = require('../controllers/BiometricController');

router.post('/timein', UploadLog.single("file"), TimeIn);
router.post('/face', ScanFace);
router.post('/leave', CreateLeave);

router.get('/option/leavetype', GetLeaveType);

module.exports = router;