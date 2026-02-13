const express = require('express');
const router = express.Router();

const upload = require("../middlewares/Upload");

const { ValidateForm } = require('../middlewares/SignatoryValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Disable, Enable, GetEmployee, GetManagement } = require('../controllers/SignatoryController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Create);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Enable);

router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetEmployee);
router.get('/option/management', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetManagement);

module.exports = router;