// models/notification.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class Notification extends Model {
    static associate(models) {
      // define association here
    }
  }
  Notification.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ReceiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'Id',
      }
    },
    Content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
  });
  return Notification;
};