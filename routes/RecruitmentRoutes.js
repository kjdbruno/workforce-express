const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/RecruitmentValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Approve, GetDetails, Disable, GeneratePDF, GetPosition, GetDepartment, GetShift, Overide } = require('../controllers/RecruitmentController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetAll);
router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetDetails);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), Create);
router.post('/:id/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), Approve);
router.post('/:id/overide', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), Overide);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), Disable);
// router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), Enable);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GeneratePDF);
/**
 * OPTIONS
 */
router.get('/option/position', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetPosition);
router.get('/option/department', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetDepartment);
router.get('/option/shift', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetShift);

module.exports = router;