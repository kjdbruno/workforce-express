// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here

      // Association with UserLog
      User.hasOne(models.UserLog, {
        foreignKey: 'user_id',
        as: 'UserLog',
      });

      // Association with Notification (SenderId)
      User.hasMany(models.Notification, {
        foreignKey: 'sender_id',
        as: 'SentNotifications',
      });

      // Association with Notification (ReceiverId)
      User.hasMany(models.Notification, {
        foreignKey: 'receiver_id',
        as: 'ReceivedNotifications',
      });

      // Association with Signatory -> signatoryId
      User.hasMany(models.ApprovalSetting, {
        foreignKey: 'approver_id',
        as: 'approver'
      });

      // Asociaton with Approval -> ownerId
      User.hasMany(models.ApprovalSetting, {
        foreignKey: 'owner_id',
        as: 'approvals'
      });

      // User → EmployeeAccount
      User.hasOne(models.EmployeeAccount, {
        foreignKey: 'user_id',
        as: 'employeeAccount'
      });

      User.hasMany(models.EmployeeAttendanceAdjustment, {
        foreignKey: 'created_by_user_id',
        as: 'attendance_adjustments'
      });

      // User → Approval overrides they performed
      User.hasMany(models.ApprovalOveride, {
        foreignKey: 'user_id',
        as: 'approvalOverrides'
      });

    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('SuperAdmin', 'Admin', 'Management', 'HR', 'Finance', 'Employee'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastFailedLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  });
  return User;
};