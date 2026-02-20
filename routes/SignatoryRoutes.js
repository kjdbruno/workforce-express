const express = require('express');
const router = express.Router();

const upload = require("../middlewares/Upload");

const { ValidateForm } = require('../middlewares/SignatoryValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Disable, Enable, GetEmployee, GetManagement, GetDetail, Update } = require('../controllers/SignatoryController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetAll);
router.get('/:id/detail', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetDetail);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Update);

router.get('/option/employee', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetEmployee);
router.get('/option/management', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetManagement);

module.exports = router;