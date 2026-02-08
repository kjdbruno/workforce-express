const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, GetAttendance, Approve, GenerateAttendancePDF, Update } = require('../controllers/AttendanceController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Create);
router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetAttendance);
router.post('/:id/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), Approve);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Update);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GenerateAttendancePDF);

// router.post('/:id/cancel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Cancel);

module.exports = router;