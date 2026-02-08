const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GenerateServicePDF, GetPosition, RemoveSalary } = require('../controllers/SalaryController');

// router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetAll);
// router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), GetDetails);
// router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Create);
// router.post('/:id/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Approve);
// router.post('/:id/cancel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'), Cancel);
router.post('/service', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR', 'Finance', 'Employee'), RemoveSalary);
router.get('/service/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR', 'Finance', 'Employee'), GenerateServicePDF);


router.get('/option/position', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetPosition);

// router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetEmployee);
// router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetLeaveType);


module.exports = router;