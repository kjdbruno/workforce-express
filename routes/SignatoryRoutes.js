const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { ValidateForm } = require('../middlewares/SignatoryValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Disable, Enable, GetUser } = require('../controllers/SignatoryController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetAll);
router.post('/', upload.single('file'), VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Create);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Enable);

router.get('/option/user', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetUser);

module.exports = router;