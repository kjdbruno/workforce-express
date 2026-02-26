const express = require('express');
const router = express.Router();

// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const UploadDocument = require("../middlewares/UploadDocument");

const { ValidateForm } = require('../middlewares/ApplicationValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, GetDetails, GeneratePDF, GetVacancy, GetCourse, GetSchool, GenerateDocument } = require('../controllers/ApplicationController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetAll);
router.get('/:id/details', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetDetails);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UploadDocument, Create);
router.post('/:id/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Update);
router.get('/document/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GenerateDocument);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GeneratePDF);

/**
 * OPTIONS
 */
router.get('/option/vacancy', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetVacancy);
router.get('/option/course', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetCourse);
router.get('/option/school', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), GetSchool);

module.exports = router;