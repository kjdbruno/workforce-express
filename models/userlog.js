// models/userLog.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class UserLog extends Model {
    static associate(models) {
      // Assuming UserLog belongs to User

      // Association with User 
      UserLog.belongsTo(models.User, {
        foreignKey: 'user_id',
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
    user_id: {
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
    socket_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_online: {
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