const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, GetAllUsers, GetAllProfileLeaves, Create, GetDetails, Approve, Cancel } = require('../controllers/LeaveController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAll);
router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAllUsers);
router.get('/:id/details', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetDetails);
router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAllProfileLeaves);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Create);
router.post('/:id/:signatoryId/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Approve);
router.post('/:id/cancel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Cancel);

module.exports = router;