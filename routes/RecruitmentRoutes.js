const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/RecruitmentValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Approve, GetDetails, Disable, Enable, GeneratePDF } = require('../controllers/RecruitmentController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetAll);
router.get('/:id/details', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetDetails);
router.post('/', VerifyToken, ValidateForm(), AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Create);
router.post('/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Approve);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Enable);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GeneratePDF);

module.exports = router;