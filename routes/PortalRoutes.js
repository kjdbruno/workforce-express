const express = require('express');
const router = express.Router();

const UploadLog = require("../middlewares/UploadLog");

const { ValidateForm } = require('../middlewares/CompanyValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { ScanBiometric, ScanFace, GetLeaveType, CreateLeave, GenerateLeavePDF, GetLeave, Approve } = require('../controllers/PortalController');

// router.post('/timein', UploadLog.single("file"), TimeIn);
router.post('/biometric', UploadLog.single("file"), ScanBiometric);
router.post('/face', ScanFace);

router.post('/leave', CreateLeave);
router.post('/leave/:id/:approverId/approve', Approve);
router.get('/leave/:controlno', GetLeave);
router.get('/leave/:id/pdf', GenerateLeavePDF);

router.get('/option/leavetype', GetLeaveType);

module.exports = router;