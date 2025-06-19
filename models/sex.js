// models/sex.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // <--- THIS IS THE REQUIRED FUNCTION EXPORT
  class Sex extends Model {
    static associate(models) {
      // --- IMPORTANT CORRECTION ---
      Sex.hasMany(models.KioskRating, { // A Sex can be associated with many KioskRatings
        foreignKey: 'sexId',
        as: 'kioskRatings',
      });
    }
  }
  Sex.init({
    id: {
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
  }, {
    sequelize,
    modelName: 'Sex',
    tableName: 'sexes',
    timestamps: false, // Sex types usually don't need timestamps
  });
  return Sex;
};