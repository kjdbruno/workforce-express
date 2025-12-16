'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Vacancy
      Company.hasMany(models.Vacancy, {
        foreignKey: 'companyId',
        as: 'vacancies'
      });

      // Association with EmploymentInformation
      Company.hasMany(models.EmploymentInformation, {
        foreignKey: 'companyId',
        as: 'employmentInformations'
      });
    }
  }
  Company.init({
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
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'Companies',
    timestamps: true
  });
  return Company;
};