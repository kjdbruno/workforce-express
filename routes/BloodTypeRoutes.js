const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/BloodTypeValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable } = require('../controllers/BloodTypeController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), ValidateForm(), Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), ValidateForm(), Update);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Enable);

module.exports = router;