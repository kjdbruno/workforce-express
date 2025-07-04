// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class User extends Model {
    static associate(models) {
      // Define associations here

      // Assuming User belongs to Role
      // and User has a foreign key RoleId that references Role's Id
      User.belongsTo(models.Role, {
        foreignKey: 'RoleId',
        as: 'Role', // Optional: used for eager loading (e.g., user.getRole())
      });
      // Assuming User has many UserLogs
      // and UserLog has a foreign key UserId that references User's Id
      User.hasOne(models.UserLog, {
        foreignKey: 'UserId',
        as: 'UserLog',
      });

      //
      User.hasMany(models.Notification, {
        foreignKey: 'SenderId',
        as: 'SentNotifications',
      });

      //
      User.hasMany(models.Notification, {
        foreignKey: 'ReceiverId',
        as: 'ReceivedNotifications',
      });
    }
  }
  User.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    EmployeeNo: {
      type: DataTypes.STRING,
      allowNull: true, // Assuming EmployeeNo is an optional field
      unique: true // Assuming EmployeeNo should be unique
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    RoleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Roles', // Assuming you have a Roles table
        key: 'Id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    Classification: {
      type: DataTypes.ENUM('Management', 'Employee')
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  });
  return User;
};