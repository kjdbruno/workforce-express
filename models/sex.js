// models/sex.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class Sex extends Model {
    static associate(models) {
      // define association here
    }
  }
  Sex.init({
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
    modelName: 'Sex',
    tableName: 'sexes',
    timestamps: false, // Sex types usually don't need timestamps
  });
  return Sex;
};