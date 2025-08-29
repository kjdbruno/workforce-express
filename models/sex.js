// models/sex.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class Sex extends Model {
    static associate(models) {
      // define association here

      // Association with Profile
      Sex.hasMany(models.Profile, {
        foreignKey: 'sexId',
        as: 'profiles'
      });
    }
  }
  Sex.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Sex',
    tableName: 'Sexes',
    timestamps: true
  });
  return Sex;
};