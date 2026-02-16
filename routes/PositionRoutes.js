const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/PositionValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable, GetDepartment } = require('../controllers/PositionController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), ValidateForm(), Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), ValidateForm(), Update);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Enable);

/**
 * Options
 */
router.get('/option/department', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetDepartment);

module.exports = router;