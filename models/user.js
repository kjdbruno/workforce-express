// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class User extends Model {
    static associate(models) {
      // Define associations here

      // Association with Role
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'Role'
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

    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    employeeNo: {
      type: DataTypes.STRING,
      allowNull: true, 
      unique: true 
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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