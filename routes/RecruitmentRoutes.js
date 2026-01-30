const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/RecruitmentValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Approve, GetDetails, Disable, GeneratePDF, GetPosition, GetDepartment, GetShift } = require('../controllers/RecruitmentController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'Finance', 'HR'), GetAll);
router.get('/:id/details', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'Finance', 'HR'), GetDetails);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR', 'Finance'), Create);
router.post('/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR', 'Finance'), Approve);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR', 'Finance'), Disable);
// router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), Enable);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR', 'Finance'), GeneratePDF);
/**
 * OPTIONS
 */
router.get('/option/position', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR', 'Finance'), GetPosition);
// router.get('/option/company', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetCompany);
router.get('/option/department', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR', 'Finance'), GetDepartment);
router.get('/option/shift', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR', 'Finance'), GetShift);
// router.get('/option/schoollevel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetSchoolLevel);

module.exports = router;