const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { ValidateForm } = require('../middlewares/EmployeeValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { 
    GetAll, 
    Create, 
    GetEmployeeProfile, 
    GetEmployeeEmployment, 
    GetEmployeeSchedule, 
    GetEmployeeEducation, 
    GetEmployeeTraining,
    GetEmployeeExperience,
    GetEmployeeDependent,
    GetEmployeeApplication,
    UpdateProfile,
    UpdateEmployment,
    CreateEducation,
    CreateTraining,
    CreateExperience,
    CreateDependent,
    GetEmployeeService,
    GetEmployeeLeaveCredit,
    GetEmployeeLeaveApplication,
    GetEmployeeDTR,
    GeneratePDF,
    GetSalaryOption,
    CreateService,
    GenerateServiceRecordPDF,
    GetEmployeePhoto,
    CreatePhoto,
    CreateLeaveCredit,
    GenerateLeavePDF
} = require('../controllers/EmployeeController');

router.get('/', VerifyToken, GetAll);
router.post('/', upload.single('file'), VerifyToken, ValidateForm(), Create);

router.get('/profile/:id', VerifyToken, GetEmployeeProfile);
router.get('/application/:id', VerifyToken, GetEmployeeApplication);
router.post('/profile/:id/update', VerifyToken, UpdateProfile);

router.get('/employment/:id', VerifyToken, GetEmployeeEmployment);
router.post('/employment/:id/update', VerifyToken, UpdateEmployment);

router.get('/education/:id', VerifyToken, GetEmployeeEducation);
router.post('/education/:id', VerifyToken, CreateEducation);

router.get('/training/:id', VerifyToken, GetEmployeeTraining);
router.post('/training/:id', VerifyToken, CreateTraining);

router.get('/experience/:id', VerifyToken, GetEmployeeExperience);
router.post('/experience/:id', VerifyToken, CreateExperience);

router.get('/dependent/:id', VerifyToken, GetEmployeeDependent);
router.post('/dependent/:id', VerifyToken, CreateDependent);

router.get('/service/:id', VerifyToken, GetEmployeeService);
router.post('/service/:id', VerifyToken, CreateService);
router.get('/service/:id/pdf', VerifyToken, GenerateServiceRecordPDF);

router.get('/photo/:id', VerifyToken, GetEmployeePhoto);
router.post('/photo/:id', upload.single('file'), VerifyToken, CreatePhoto);

router.get('/document/:id', VerifyToken, GetEmployeeProfile);
router.get('/digitalid/:id', VerifyToken, GetEmployeeProfile);

router.get('/leave/credit/:id', VerifyToken, GetEmployeeLeaveCredit);
router.post('/leave/credit/:id', VerifyToken, CreateLeaveCredit);
router.get('/leave/application/:id', VerifyToken, GetEmployeeLeaveApplication);
router.get('/leave/application/:id/pdf', VerifyToken, GenerateLeavePDF);

router.get('/dtr/:id', VerifyToken, GetEmployeeDTR);
router.get('/dtr/:id/:month/:year/pdf', VerifyToken, GeneratePDF);

router.get('/option/salary', VerifyToken, GetSalaryOption);

module.exports = router;