const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/DepartmentValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable } = require('../controllers/DepartmentController');

const { GetDepartmentSignatory, CreateDepartmentSignatory, DisableDepartmentSignatory, EnableDepartmentSignatory } = require('../controllers/SignatoryController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'),  GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Update);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'),  Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'),  Enable);

router.get('/:id/signatory', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetDepartmentSignatory);
router.post('/:id/signatory', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), CreateDepartmentSignatory);
router.post('/:id/signatory/:type/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), DisableDepartmentSignatory);
router.post('/:id/signatory/:type/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), EnableDepartmentSignatory);

module.exports = router;