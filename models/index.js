'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const config = require(__dirname + '/../config/config.js')[process.env.NODE_ENV || 'development'];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Base Models (No Foreign Keys)
db.Role = require('./role')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.UserLog = require('./userlog')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);
db.Sex = require('./sex')(sequelize, Sequelize.DataTypes);
db.CivilStatus = require('./civilstatus')(sequelize, Sequelize.DataTypes);
db.BloodType = require('./bloodtype')(sequelize, Sequelize.DataTypes);
db.Region = require('./region')(sequelize, Sequelize.DataTypes);
db.Province = require('./province')(sequelize, Sequelize.DataTypes);
db.Town = require('./town')(sequelize, Sequelize.DataTypes);
db.Barangay = require('./barangay')(sequelize, Sequelize.DataTypes);
db.Department = require('./department')(sequelize, Sequelize.DataTypes);
db.EmploymentStatus = require('./employmentstatus')(sequelize, Sequelize.DataTypes);
db.AppointmentStatus = require('./appointmentstatus')(sequelize, Sequelize.DataTypes);
db.SalaryClass = require('./salaryclass')(sequelize, Sequelize.DataTypes);
db.SalaryGrade = require('./salarygrade')(sequelize, Sequelize.DataTypes);
db.Rate = require('./rate')(sequelize, Sequelize.DataTypes);
db.Position = require('./position')(sequelize, Sequelize.DataTypes);
db.SchoolLevel = require('./schoollevel')(sequelize, Sequelize.DataTypes);
db.School = require('./school')(sequelize, Sequelize.DataTypes);
db.Course = require('./course')(sequelize, Sequelize.DataTypes);
db.TaxCode = require('./taxcode')(sequelize, Sequelize.DataTypes);
db.TaxTable = require('./taxtable')(sequelize, Sequelize.DataTypes);
db.LeaveType = require('./leavetype')(sequelize, Sequelize.DataTypes);
db.EligibilityType = require('./eligibilitytype')(sequelize, Sequelize.DataTypes);
db.DocumentType = require('./documenttype')(sequelize, Sequelize.DataTypes);
db.Relationship = require('./relationship')(sequelize, Sequelize.DataTypes);
db.Training = require('./training')(sequelize, Sequelize.DataTypes);
db.PerformanceCriteria = require('./performancecriteria')(sequelize, Sequelize.DataTypes);

// Employment-related dependencies (before EmploymentInformation)
db.EmploymentHistory = require('./employmenthistory')(sequelize, Sequelize.DataTypes);
db.EmploymentDocument = require('./employmentdocument')(sequelize, Sequelize.DataTypes);
db.EmploymentLogs = require('./employmentlogs')(sequelize, Sequelize.DataTypes);

// Employee info
// These models are referenced by Profile and EmploymentInformation
// so we load them first to ensure proper subclassing
db.EmployeeContactDetail = require('./employeecontactdetail')(sequelize, Sequelize.DataTypes);
db.EmployeeDependent = require('./employeedependent')(sequelize, Sequelize.DataTypes);
db.EmployeeEducation = require('./employeeeducation')(sequelize, Sequelize.DataTypes);
db.EmployeeEligibility = require('./employeeeligibility')(sequelize, Sequelize.DataTypes);
db.EmployeeTraining = require('./employeetraining')(sequelize, Sequelize.DataTypes);
db.EmployeeLeaveApplication = require('./employeeleaveapplication')(sequelize, Sequelize.DataTypes);
db.EmployeeLeaveCredit = require('./employeeleavecredit')(sequelize, Sequelize.DataTypes);
db.EmployeePerformance = require('./employeeperformance')(sequelize, Sequelize.DataTypes);
db.EmployeeScore = require('./employeescore')(sequelize, Sequelize.DataTypes);

// Profile (central model)
db.Profile = require('./profile')(sequelize, Sequelize.DataTypes);

// Application related
db.Application = require('./application')(sequelize, Sequelize.DataTypes);
db.ApplicationDocument = require('./applicationdocument')(sequelize, Sequelize.DataTypes);

// EmploymentInformation now loaded after dependencies
db.EmploymentInformation = require('./employmentinformation')(sequelize, Sequelize.DataTypes);

// Associate all models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;