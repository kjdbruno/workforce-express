// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here

      // Association with Role
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role'
      });

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
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    level: {
      type: DataTypes.ENUM('Management', 'Employee'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  });
  return User;
};