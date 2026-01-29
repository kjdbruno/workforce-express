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
} = require('../controllers/EmployeeController');
const { GetShift } = require('../controllers/RecruitmentController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetAll);
router.post('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), Create);

router.get('/:id/information', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetEmployeeRecord);
router.post('/:id/information', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), UpdateEmployee);

router.post('/:id/employment', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), UpdateEmployment);

router.post('/:id/salary', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), CreateSalary);
router.post('/:id/salary/disable', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), RemoveSalary);

router.get('/service', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetServiceRecord);
router.get('/education', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetEducation);
router.get('/training', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetTraining);
router.get('/experience', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetExperience);
router.get('/dependent', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDependent);
router.get('/document', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDocument);
router.get('/leave/balance', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetLeaveBalance);
router.get('/leave/application', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetLeaveApplication);
// router.get('/attendance', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetAttendance);
// router.get('/account', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetAccount);
// router.get('/photo', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetPhoto);
/**
 * OPTIONS
 */
router.get('/option/applicant', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetApplicant);
router.get('/option/position', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetPosition);
router.get('/option/department', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetDepartment);
router.get('/option/shift', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetShift);
router.get('/option/school', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetSchool);
router.get('/option/course', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetCourse);
router.get('/option/leavetype', VerifyToken, AuthorizeRoles('SuperAdmin', 'Supervisor', 'Admin', 'HR'), GetLeaveType);

module.exports = router;