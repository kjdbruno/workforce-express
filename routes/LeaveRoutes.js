const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, GetEmployee, GetLeaveType, Create, GetDetails, GenerateLeavePDF, Approve, Cancel, Overide } = require('../controllers/LeaveController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetAll);
router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetDetails);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Create);
router.post('/:id/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), Approve);
router.post('/:id/overide', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), Overide);
router.post('/:id/cancel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Cancel);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GenerateLeavePDF);

router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetEmployee);
router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetLeaveType);


module.exports = router;