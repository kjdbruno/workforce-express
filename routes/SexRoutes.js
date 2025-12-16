const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable } = require('../controllers/SexController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), ValidateForm(), Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), ValidateForm(), Update);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Enable);

module.exports = router;