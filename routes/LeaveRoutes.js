const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, GetAllUsers, GetAllProfileLeaves, Create, GetDetails, File } = require('../controllers/LeaveController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Employee'), GetAll);
router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Employee'), GetAllUsers);
router.get('/:id/details', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR', 'Employee'), GetDetails);
router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Employee'), GetAllProfileLeaves);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Employee'), Create);
router.post('/:id/:signatoryId/file', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR', 'Employee'), File);
// router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), ValidateForm(), Update);
// router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Disable);
// router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Enable);

module.exports = router;