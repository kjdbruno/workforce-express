'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SchoolLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with ProfileEducation
      SchoolLevel.hasMany(models.ProfileEducation, {
        foreignKey: 'levelId',
        as: 'profileEducations'
      });

      // Association with Vacancy
      SchoolLevel.hasMany(models.Vacancy, {
        foreignKey: 'levelId',
        as: 'vacancies'
      });
    }
  }
  SchoolLevel.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT('lonng'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'SchoolLevel',
    tableName: 'SchoolLevels', 
    timestamps: true
  });
  return SchoolLevel;
};