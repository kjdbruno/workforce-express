// models/index.js - Tailored for bundling
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

// Explicitly require each model.
// This is safer for bundlers as they can statically analyze these requires.
// If your models directory is huge, this can be cumbersome,
// but for a typical number of models, it's robust.
db.Office = require('./office')(sequelize, Sequelize.DataTypes);
db.KioskRating = require('./kioskRating')(sequelize, Sequelize.DataTypes);
db.Rating = require('./rating')(sequelize, Sequelize.DataTypes);
db.UserDetail = require('./userDetail')(sequelize, Sequelize.DataTypes);
db.Sex = require('./sex')(sequelize, Sequelize.DataTypes);
db.Complaint = require('./complaint')(sequelize, Sequelize.DataTypes);
db.ComplaintDetail = require('./complaintDetail')(sequelize, Sequelize.DataTypes);
db.ComplaintFile = require('./complaintFile')(sequelize, Sequelize.DataTypes);
db.ComplaintOffice = require('./complaintOffice')(sequelize, Sequelize.DataTypes);
db.ComplaintType = require('./complaintType')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);
db.Response = require('./response')(sequelize, Sequelize.DataTypes);
db.ResponseFile = require('./responseFile')(sequelize, Sequelize.DataTypes);
db.ResponseRating = require('./responseRating')(sequelize, Sequelize.DataTypes);
db.Role = require('./role')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.UserLog = require('./userlog')(sequelize, Sequelize.DataTypes);
// ... add all your models here explicitly

// Run associations for all loaded models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;