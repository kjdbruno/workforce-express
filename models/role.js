// models/role.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class Role extends Model {
    static associate(models) {
      
    }
  }
  Role.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
  });
  return Role;
};