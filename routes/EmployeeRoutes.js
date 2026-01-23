const express = require('express');
const router = express.Router();

const upload = require("../middlewares/Upload");

const multer = require('multer');
const storage = multer.memoryStorage();
const uploading = multer({ storage });

const { ValidateForm } = require('../middlewares/EmployeeValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { 
    GetAll,
    GetApplicant,
    GetPosition,
    GetCompany,
    GetDepartment,
    GetSchedule,
    GetSchool,
    GetCourse,
    Create,
    GetServiceRecord,
    GetEducation,
    GetTraining,
    GetExperience,
    GetDependent,
    GetDocument,
    GetLeaveBalance,
    GetLeaveType,
    GetLeaveApplication,
    GetEmployeeRecord,
    GetAttendance,
    UpdateEmployee,
    UpdateEducation,
    UpdateTraining,
    UpdateExperience,
    UpdateDependent,
    CreateDocument,
    UpdateEmployment,
    CreateSalary,
    CreateBiometric,
    GetAccount,
    CreateAccount,
    GetPhoto,
    CreatePhoto,
    CreateLeave, 
} = require('../controllers/EmployeeController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetAll);

router.get('/information/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetEmployeeRecord);
router.get('/service', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetServiceRecord);
router.get('/education', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetEducation);
router.get('/training', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetTraining);
router.get('/experience', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetExperience);
router.get('/dependent', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDependent);
router.get('/document', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDocument);
router.get('/leave/balance', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetLeaveBalance);
router.get('/leave/application', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetLeaveApplication);
router.get('/attendance', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetAttendance);
router.get('/account', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetAccount);
router.get('/photo', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetPhoto);
/**
 * OPTIONS
 */
router.get('/option/applicant', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetApplicant);
router.get('/option/position', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetPosition);
router.get('/option/company', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetCompany);
router.get('/option/department', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDepartment);
router.get('/option/schedule', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetSchedule);
router.get('/option/school', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetSchool);
router.get('/option/course', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetCourse);
router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetLeaveType);



router.post('/', upload.any(), VerifyToken, Create);

router.post('/:id/information', VerifyToken, UpdateEmployee);
router.post('/:id/employment', VerifyToken, UpdateEmployment);
router.post('/:id/salary', VerifyToken, CreateSalary);
router.post('/:id/biometric', VerifyToken, CreateBiometric);
router.post('/:id/education', VerifyToken, UpdateEducation);
router.post('/:id/training', VerifyToken, UpdateTraining);
router.post('/:id/experience', VerifyToken, UpdateExperience);
router.post('/:id/dependent', VerifyToken, UpdateDependent);
router.post('/:id/document', upload.any(), VerifyToken, CreateDocument);
router.post('/:id/leave', VerifyToken, CreateLeave);
router.post('/:id/account', upload.any(), VerifyToken, CreateAccount);
router.post('/:id/photo', uploading.single('file'), VerifyToken, CreatePhoto);

// router.get('/profile/:id', VerifyToken, GetEmployeeProfile);
// router.get('/application/:id', VerifyToken, GetEmployeeApplication);
// router.post('/profile/:id/update', VerifyToken, UpdateProfile);

// router.get('/employment/:id', VerifyToken, GetEmployeeEmployment);
// router.post('/employment/:id/update', VerifyToken, UpdateEmployment);

// router.get('/education/:id', VerifyToken, GetEmployeeEducation);
// router.post('/education/:id', VerifyToken, CreateEducation);

// router.get('/training/:id', VerifyToken, GetEmployeeTraining);
// router.post('/training/:id', VerifyToken, CreateTraining);

// router.get('/experience/:id', VerifyToken, GetEmployeeExperience);
// router.post('/experience/:id', VerifyToken, CreateExperience);

// router.get('/dependent/:id', VerifyToken, GetEmployeeDependent);
// router.post('/dependent/:id', VerifyToken, CreateDependent);

// router.get('/service/:id', VerifyToken, GetEmployeeService);
// router.post('/service/:id', VerifyToken, CreateService);
// router.get('/service/:id/pdf', VerifyToken, GenerateServiceRecordPDF);

// router.get('/photo/:id', VerifyToken, GetEmployeePhoto);
// router.post('/photo/:id', upload.single('file'), VerifyToken, CreatePhoto);

// router.get('/document/:id', VerifyToken, GetEmployeeProfile);
// router.get('/digitalid/:id', VerifyToken, GetEmployeeProfile);

// router.get('/leave/credit/:id', VerifyToken, GetEmployeeLeaveCredit);
// router.post('/leave/credit/:id', VerifyToken, CreateLeaveCredit);
// router.get('/leave/application/:id', VerifyToken, GetEmployeeLeaveApplication);
// router.get('/leave/application/:id/pdf', VerifyToken, GenerateLeavePDF);

// router.get('/dtr/:id', VerifyToken, GetEmployeeDTR);
// router.get('/dtr/:id/:month/:year/pdf', VerifyToken, GeneratePDF);

// router.get('/option/salary', VerifyToken, GetSalaryOption);

module.exports = router;