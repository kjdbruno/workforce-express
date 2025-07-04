// models/userLog.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class UserLog extends Model {
    static associate(models) {
      // Assuming UserLog belongs to User
      // and UserLog has a foreign key UserId that references User's Id
      // This allows you to access the User associated with a UserLog instance
      UserLog.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'User' 
      });
    }
  }
  UserLog.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'Id',
      }
    },
    SocketId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Assuming only one active socket ID per user at a time
    },
    IsOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'UserLog',
    tableName: 'userlogs',
    timestamps: true,
  });
  return UserLog;
};