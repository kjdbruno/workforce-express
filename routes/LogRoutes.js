const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, GetLog } = require('../controllers/LogController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAll);
router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetLog);
// router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAllUsers);
// router.get('/:id/details', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetDetails);
// router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAllProfileLeaves);
// router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Create);
// router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAttendance);
// router.post('/:id/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Approve);
// router.post('/dtr/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), UpdateDTR);

// router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GenerateAttendancePDF);

// router.post('/:id/cancel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Cancel);

module.exports = router;