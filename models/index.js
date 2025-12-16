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
db.Sex = require('./sex')(sequelize, Sequelize.DataTypes);
db.CivilStatus = require('./civilstatus')(sequelize, Sequelize.DataTypes);
db.BloodType = require('./bloodtype')(sequelize, Sequelize.DataTypes);
db.Region = require('./region')(sequelize, Sequelize.DataTypes);
db.Province = require('./province')(sequelize, Sequelize.DataTypes);
db.Town = require('./town')(sequelize, Sequelize.DataTypes);
db.Barangay = require('./barangay')(sequelize, Sequelize.DataTypes);
db.Profile = require('./profile')(sequelize, Sequelize.DataTypes);
db.ProfilePhoto = require('./profilephoto')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.UserLog = require('./userlog')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);
db.SignatoryType = require('./signatorytype')(sequelize, Sequelize.DataTypes);
db.Signatory = require('./signatory')(sequelize, Sequelize.DataTypes);
db.Department = require('./department')(sequelize, Sequelize.DataTypes);
db.EmploymentStatus = require('./employmentstatus')(sequelize, Sequelize.DataTypes);
db.AppointmentStatus = require('./appointmentstatus')(sequelize, Sequelize.DataTypes);
db.Increment = require('./increment')(sequelize, Sequelize.DataTypes);
db.SalaryClass = require('./salaryclass')(sequelize, Sequelize.DataTypes);
db.SalaryGrade = require('./salarygrade')(sequelize, Sequelize.DataTypes);
db.Position = require('./position')(sequelize, Sequelize.DataTypes);
db.PositionQualification = require('./positionqualification')(sequelize, Sequelize.DataTypes);
db.Salary = require('./salary')(sequelize, Sequelize.DataTypes);
db.Rate = require('./rate')(sequelize, Sequelize.DataTypes);
db.School = require('./school')(sequelize, Sequelize.DataTypes);
db.SchoolLevel = require('./schoollevel')(sequelize, Sequelize.DataTypes);
db.Course = require('./course')(sequelize, Sequelize.DataTypes);
db.TaxCode = require('./taxcode')(sequelize, Sequelize.DataTypes);
db.LeaveType = require('./leavetype')(sequelize, Sequelize.DataTypes);
db.GovernmentAgency = require('./governmentagency')(sequelize, Sequelize.DataTypes);
db.ScheduleClass = require('./scheduleclass')(sequelize, Sequelize.DataTypes);
db.ScheduleShift = require('./scheduleshift')(sequelize, Sequelize.DataTypes);
db.PremiumPay = require('./premiumpay')(sequelize, Sequelize.DataTypes);
db.Holiday = require('./holiday')(sequelize, Sequelize.DataTypes);
db.IncidentClass = require('./incidentclass')(sequelize, Sequelize.DataTypes);
db.IncidentRole = require('./incidentrole')(sequelize, Sequelize.DataTypes);
db.Company = require('./company')(sequelize, Sequelize.DataTypes);
db.Vacancy = require('./vacancy')(sequelize, Sequelize.DataTypes);
db.Application = require('./application')(sequelize, Sequelize.DataTypes);
db.DocumentType = require('./documenttype')(sequelize, Sequelize.DataTypes);
db.ProfileDocument = require('./profiledocument')(sequelize, Sequelize.DataTypes);
db.Relationship = require('./relationship')(sequelize, Sequelize.DataTypes);
db.TrainingType = require('./trainingtype')(sequelize, Sequelize.DataTypes);
db.ProfileDependent = require('./profiledependent')(sequelize, Sequelize.DataTypes);
db.ProfileEducation = require('./profileeducation')(sequelize, Sequelize.DataTypes);
db.ProfileTraining = require('./profiletraining')(sequelize, Sequelize.DataTypes);
db.ProfileExperience = require('./profileexperience')(sequelize, Sequelize.DataTypes);
db.EmploymentInformation = require('./employmentinformation')(sequelize, Sequelize.DataTypes);
db.EmploymentHistory = require('./employmenthistory')(sequelize, Sequelize.DataTypes);
db.VacancyRequest = require('./vacancyrequest')(sequelize, Sequelize.DataTypes);
db.ProfileLeave = require('./profileleave')(sequelize, Sequelize.DataTypes);
db.Leave = require('./leave')(sequelize, Sequelize.DataTypes);
db.LeaveRequest = require('./leaverequest')(sequelize, Sequelize.DataTypes);
db.DtrRequest = require('./dtrrequest')(sequelize, Sequelize.DataTypes);
db.TimeCard = require('./timecard')(sequelize, Sequelize.DataTypes);
db.TimeLog = require('./timelog')(sequelize, Sequelize.DataTypes);
db.Overtime = require('./overtime')(sequelize, Sequelize.DataTypes);
db.OvertimeRequest = require('./overtimerequest')(sequelize, Sequelize.DataTypes);
db.ProfileOvertime = require('./profileovertime')(sequelize, Sequelize.DataTypes);

// Associate all models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;