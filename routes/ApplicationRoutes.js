const express = require('express');
const router = express.Router();

// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const UploadDocument = require("../middlewares/UploadDocument");

const { ValidateForm } = require('../middlewares/ApplicationValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, GetDetails, GeneratePDF, GetVacancy, GetCourse, GetSchool } = require('../controllers/ApplicationController');

router.get('/', VerifyToken, GetAll);
router.get('/:id/details', VerifyToken, GetDetails);
router.post('/', VerifyToken, UploadDocument.any(), Create);
router.post('/:id/update', VerifyToken, Update);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GeneratePDF);

/**
 * OPTIONS
 */
router.get('/option/vacancy', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetVacancy);
router.get('/option/course', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetCourse);
router.get('/option/school', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetSchool);

module.exports = router;