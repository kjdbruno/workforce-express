const express = require('express');
const router = express.Router();

const UploadEmployeePhoto = require("../middlewares/UploadEmployeePhoto");
const UploadDocument = require("../middlewares/UploadDocument");
const UploadEmployeeSignature = require('../middlewares/UploadEmployeeSignature');

const multer = require('multer');
const storage = multer.memoryStorage();
const uploading = multer({ storage });

const { ValidateForm } = require('../middlewares/EmployeeValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { 
    GetAll,
    GetApplicant,
    GetPosition,
    GetDepartment,
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
    UpdateEmployee,
    UpdateEmployment,
    CreateSalary,
    RemoveSalary,
    GetPhoto,
    CreatePhoto,
    GetAccount,
    CreateAccount,
    UpdateEducation,
    UpdateTraining,
    UpdateExperience,
    UpdateDependent,
    CreateDocument,
    CreateLeave,
    CreateBiometric,
    GetAttendance,
    GenerateIdPDF,
    GetSignature,
    CreateSignature,
    GetShift,
    GetSchedule,
    UpdateSchedule
} = require('../controllers/EmployeeController');


router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), Create);

router.get('/:id/information', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetEmployeeRecord);
router.post('/:id/information', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UpdateEmployee);

router.post('/:id/employment', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UpdateEmployment);

router.post('/:id/salary', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), CreateSalary);
router.post('/:id/salary/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), RemoveSalary);

router.get('/service', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetServiceRecord);

router.get('/photo', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetPhoto);
router.post('/:id/photo', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UploadEmployeePhoto.single("file"), CreatePhoto);

router.get('/account', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetAccount);
router.post('/:id/account', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), CreateAccount);

router.get('/schedule', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetSchedule);
router.post('/:id/schedule', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UpdateSchedule);

router.get('/signature', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetSignature);
router.post('/:id/signature', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UploadEmployeeSignature.single("file"), CreateSignature);

router.get('/education', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetEducation);
router.post('/:id/education', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UpdateEducation);

router.get('/training', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetTraining);
router.post('/:id/training', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UpdateTraining);

router.get('/experience', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetExperience);
router.post('/:id/experience', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UpdateExperience);

router.get('/dependent', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetDependent);
router.post('/:id/dependent', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UpdateDependent);

router.get('/document', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetDocument);
router.post('/:id/document', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), UploadDocument.any(), CreateDocument);

router.get('/:id/pdf', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GenerateIdPDF);

router.get('/leave/balance', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetLeaveBalance);
router.get('/leave/application', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetLeaveApplication);
router.post('/:id/leave', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), CreateLeave);

router.post('/:id/biometric', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'HR'), CreateBiometric);

router.get('/attendance', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetAttendance);


/**
 * OPTIONS
 */
router.get('/option/applicant', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetApplicant);
router.get('/option/position', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetPosition);
router.get('/option/department', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetDepartment);
router.get('/option/shift', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetShift);
router.get('/option/school', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetSchool);
router.get('/option/course', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetCourse);
router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Management', 'Admin', 'HR'), GetLeaveType);

module.exports = router;