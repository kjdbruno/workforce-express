// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here

      // Association with UserLog
      User.hasOne(models.UserLog, {
        foreignKey: 'userId',
        as: 'UserLog',
      });

      // Association with Notification (SenderId)
      User.hasMany(models.Notification, {
        foreignKey: 'senderId',
        as: 'SentNotifications',
      });

      // Association with Notification (ReceiverId)
      User.hasMany(models.Notification, {
        foreignKey: 'receiverId',
        as: 'ReceivedNotifications',
      });

      // Association with Profile
      User.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });

      // Association with Signatory
      User.hasMany(models.Signatory, {
        foreignKey: 'userId',
        as: 'signatories'
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
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
      type: DataTypes.ENUM('SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance', 'Employee'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
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