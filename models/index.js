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
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.UserLog = require('./userlog')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);
db.Vacancy = require('./vacancy')(sequelize, Sequelize.DataTypes);
db.Position = require('./position')(sequelize, Sequelize.DataTypes);
db.Company = require('./company')(sequelize, Sequelize.DataTypes);
db.Department = require('./department')(sequelize, Sequelize.DataTypes);
db.Schedule = require('./schedule')(sequelize, Sequelize.DataTypes);
db.PayrollGroup = require('./payrollgroup')(sequelize, Sequelize.DataTypes);
db.Applicant = require('./applicant')(sequelize, Sequelize.DataTypes);
db.School = require('./school')(sequelize, Sequelize.DataTypes);
db.Course = require('./course')(sequelize, Sequelize.DataTypes);
db.ApplicantEducation = require('./applicanteducation')(sequelize, Sequelize.DataTypes);
db.ApplicantExperience = require('./applicantexperience')(sequelize, Sequelize.DataTypes);
db.ApplicantTraining = require('./applicanttraining')(sequelize, Sequelize.DataTypes);
db.ApplicantDocument = require('./applicantdocument')(sequelize, Sequelize.DataTypes);

db.Employee = require('./employee')(sequelize, Sequelize.DataTypes);
db.EmployeeAccount = require('./employeeaccount')(sequelize, Sequelize.DataTypes);
db.Employment = require('./employment')(sequelize, Sequelize.DataTypes);
db.SalarySchedule = require('./salaryschedule')(sequelize, Sequelize.DataTypes);
db.EmployeeEducation = require('./employeeeducation')(sequelize, Sequelize.DataTypes);
db.EmployeeExperience = require('./employeeexperience')(sequelize, Sequelize.DataTypes);
db.EmployeeTraining = require('./employeetraining')(sequelize, Sequelize.DataTypes);
db.EmployeeDocument = require('./employeedocument')(sequelize, Sequelize.DataTypes);

db.ApprovalSetting = require('./approvalsetting')(sequelize, Sequelize.DataTypes);
db.Approval = require('./approval')(sequelize, Sequelize.DataTypes);
// Associate all models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;