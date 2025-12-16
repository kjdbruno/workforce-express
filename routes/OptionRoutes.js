const express = require('express');
const router = express.Router();

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { 
    GetRoles, 
    GetEmployees, 
    GetDepartments, 
    GetPositions, 
    GetScheduleClasses,
    GetPremiumPays,
    GetSalaryClasses,
    GetSalaryGrades,
    GetIncrements,
    GetSalaries,
    GetRecruitmentSteps,
    GetCompanies,
    GetRecruitmentSchedules,
    GetSexes,
    GetSchoolLevels,
    GetEmploymentStatuses,
    GetSignatoryTypes,
    GetSignatories,
    GetRecruitmentPositions,
    GetRecruitmentQualifications,
    GetProfiles,
    GetMaritalStatuses,
    GetBloodTypes,
    GetProvinces,
    GetTowns,
    GetBarangays,
    GetSchools,
    GetCourses,
    GetDocumentTypes,
    GetRegions,
    GetVacancies,
    GetHiredApplications,
    GetTaxCodes,
    GetAppointmnentStatuses,
    GetRelationships,
    GetSalaryRates,
    GetSalaryPositions,
    GetRates,
    GetEmploymentSalaryPositions,
    GetTrainingTypes
} = require('../controllers/OptionController');

router.get('/roles', VerifyToken, GetRoles);
router.get('/employees', VerifyToken, GetEmployees);
router.get('/departments', VerifyToken, GetDepartments);
router.get('/positions', VerifyToken, GetPositions);
router.get('/scheduleclasses', VerifyToken, GetScheduleClasses);
router.get('/premiumpays', VerifyToken, GetPremiumPays);
router.get('/salaryclasses', VerifyToken, GetSalaryClasses);
router.get('/salarygrades', VerifyToken, GetSalaryGrades);
router.get('/increments', VerifyToken, GetIncrements);
router.get('/salaries', VerifyToken, GetSalaries);
router.get('/recruitmentsteps', VerifyToken, GetRecruitmentSteps);
router.get('/companies', VerifyToken, GetCompanies);
router.get('/recruitmentschedules', VerifyToken, GetRecruitmentSchedules);
router.get('/sexes', VerifyToken, GetSexes);
router.get('/schoollevels', VerifyToken, GetSchoolLevels);
router.get('/employmentstatuses', VerifyToken, GetEmploymentStatuses);
router.get('/signatorytypes', VerifyToken, GetSignatoryTypes);
router.get('/signatories', VerifyToken, GetSignatories);
router.get('/recruitmentpositions', VerifyToken, GetRecruitmentPositions);
router.get('/recruitmentqualifications', VerifyToken, GetRecruitmentQualifications);
router.get('/profiles', VerifyToken, GetProfiles);
router.get('/maritalstatuses', VerifyToken, GetMaritalStatuses);
router.get('/bloodtypes', VerifyToken, GetBloodTypes);
router.get('/regions', VerifyToken, GetRegions);
router.get('/provinces', VerifyToken, GetProvinces);
router.get('/towns', VerifyToken, GetTowns);
router.get('/barangays', VerifyToken, GetBarangays);
router.get('/schools', VerifyToken, GetSchools);
router.get('/courses', VerifyToken, GetCourses);
router.get('/documenttypes', VerifyToken, GetDocumentTypes);
router.get('/vacancies', VerifyToken, GetVacancies);
router.get('/hiredapplications', VerifyToken, GetHiredApplications);
router.get('/taxcodes', VerifyToken, GetTaxCodes);
router.get('/appointmentstatuses', VerifyToken, GetAppointmnentStatuses);
router.get('/relationships', VerifyToken, GetRelationships);
router.get('/salaryrates', VerifyToken, GetSalaryRates);
router.get('/salarypositions', VerifyToken, GetSalaryPositions);
router.get('/rates', VerifyToken, GetRates);
router.get('/employmentsalarypositions', VerifyToken, GetEmploymentSalaryPositions);
router.get('/trainingtypes', VerifyToken, GetTrainingTypes);

module.exports = router;