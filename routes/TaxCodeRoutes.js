const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/TaxCodeValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable } = require('../controllers/TaxCodeController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR'), ValidateForm(), Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR'), ValidateForm(), Update);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Supervisor', 'HR'), Enable);

module.exports = router;