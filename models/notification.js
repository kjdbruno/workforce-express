// models/notification.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class Notification extends Model {
    static associate(models) {
      // define association here

      // Association with User (senderId)
      Notification.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'Sender',
      });

      // Association with User (receiverId)
      Notification.belongsTo(models.User, {
        foreignKey: 'receiver_id',
        as: 'Receiver',
      });

    }
  }
  Notification.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('unread', 'read', 'archived'),
      defaultValue: 'unread'
    },
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
    timestamps: true
  });
  return Notification;
};