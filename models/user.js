// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class User extends Model {
    static associate(models) {
      User.hasOne(models.UserDetail, {
        foreignKey: 'userId',
        as: 'profile',
        onDelete: 'CASCADE',
      });
      User.hasOne(models.UserLog, {
        foreignKey: 'userId',
        as: 'log',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Notification, {
        foreignKey: 'receiverId',
        as: 'notifications',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Response, {
        foreignKey: 'userId',
        as: 'responses',
        onDelete: 'SET NULL',
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
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isActive: {
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