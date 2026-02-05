const express = require('express');
const router = express.Router();

const upload = require("../middlewares/Upload");

const { ValidateForm } = require('../middlewares/SignatoryValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Disable, Enable, GetUser } = require('../controllers/SignatoryController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Create);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Enable);

router.get('/option/user', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetUser);

module.exports = router;