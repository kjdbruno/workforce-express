const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/UserValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, UpdateStatus,  } = require('../controllers/UserController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetAll);
router.post('/:id/status', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), UpdateStatus);

module.exports = router;