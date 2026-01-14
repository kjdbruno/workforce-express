const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable, GetUsers } = require('../controllers/VacancySignatoryController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetAll);
router.post('/', upload.single('file'), VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Create);
router.post('/:id/update', upload.single('file'), VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Update);
router.post('/:id/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Disable);
router.post('/:id/enable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), Enable);

router.get('/user/option', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin'), GetUsers);

module.exports = router;