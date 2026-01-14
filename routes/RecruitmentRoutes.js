const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/RecruitmentValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Approve, GetDetails, Disable, Enable, GeneratePDF, GetPosition, GetCompany, GetDepartment, GetSchedule, GetSchoolLevel } = require('../controllers/RecruitmentController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetAll);
router.get('/:id/details', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDetails);
router.post('/', VerifyToken, ValidateForm(), AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), Create);
router.post('/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), Approve);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), Enable);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GeneratePDF);
/**
 * OPTIONS
 */
router.get('/option/position', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetPosition);
router.get('/option/company', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetCompany);
router.get('/option/department', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDepartment);
router.get('/option/schedule', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetSchedule);
router.get('/option/schoollevel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetSchoolLevel);

module.exports = router;