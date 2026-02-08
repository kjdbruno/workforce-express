const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/CompanyValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, GetEmployee, GetDetails, Update, Cancel, GenerateOvertimePDF } = require('../controllers/OvertimeController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetAll);
router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetDetails);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Update);
router.post('/:id/cancel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Cancel);
router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GenerateOvertimePDF);

router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetEmployee);

module.exports = router;