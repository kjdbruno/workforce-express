const express = require('express');
const router = express.Router();

const UploadLog = require("../middlewares/UploadLog");

const { ValidateForm } = require('../middlewares/CompanyValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { ScanBiometric, ScanFace, GetLeaveType, CreateLeave, GenerateLeavePDF, GetLeave, Approve, GetAllLeave, GetLog, GetAllAttendance, GetAttendance, ApproveAttendance, GenerateAttendancePDF } = require('../controllers/PortalController');

// router.post('/timein', UploadLog.single("file"), TimeIn);
router.post('/biometric', UploadLog.single("file"), ScanBiometric);
router.post('/face', ScanFace);

router.post('/leave', CreateLeave);
router.post('/leave/:id/:approverId/approve', Approve);
router.get('/leave/application', GetAllLeave);
router.get('/leave/application/:id', GetLeave);
router.get('/leave/:id/pdf', GenerateLeavePDF);

router.get('/dtr/logs', GetLog);
router.get('/dtr/attendance', GetAllAttendance);
router.get('/dtr/attendance/:id', GetAttendance);
router.post('/dtr/attendance/approve', ApproveAttendance);
router.get('/dtr/attendance/:id/pdf', GenerateAttendancePDF);

router.get('/option/leavetype', GetLeaveType);

module.exports = router;