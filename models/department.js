'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with EmploymentInformation
      Department.hasMany(models.EmploymentInformation, {
        foreignKey: 'departmentId',
        as: 'employmentInformations'
      });

      // Association with Vacancy
      Department.hasMany(models.Vacancy, {
        foreignKey: 'departmentId',
        as: 'vacancies'
      });
    }
  }
  Department.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Deoartment',
    tableName: 'Departments',
    timestamps: true
  });
  return Department;
};