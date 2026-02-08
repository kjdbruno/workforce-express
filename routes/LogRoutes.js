const express = require('express');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, GetLog } = require('../controllers/LogController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetAll);
router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetLog);

module.exports = router;