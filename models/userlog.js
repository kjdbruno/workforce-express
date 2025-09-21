// models/userLog.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class UserLog extends Model {
    static associate(models) {
      // Assuming UserLog belongs to User

      // Association with User 
      UserLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'User' 
      });

    }
  }
  UserLog.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'UserLog',
    tableName: 'UserLogs',
    timestamps: true,
  });
  return UserLog;
};