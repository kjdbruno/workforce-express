const express = require('express');
const router = express.Router();

// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const upload = require("../middlewares/Upload");

const { ValidateForm } = require('../middlewares/ApplicationValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable, GetDetails, GeneratePDF } = require('../controllers/ApplicationController');

router.get('/', VerifyToken, GetAll);
router.get('/:id/details', VerifyToken, GetDetails);
router.post('/', upload.any(), VerifyToken, ValidateForm(), Create);
router.post('/:id/update', VerifyToken, Update);
router.post('/:id/disable', VerifyToken, Disable);
router.post('/:id/enable', VerifyToken, Enable);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GeneratePDF);

module.exports = router;