'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmploymentStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assciation with EmploymentInformation
      EmploymentStatus.hasMany(models.EmploymentInformation, {
        foreignKey: 'employmentId',
        as: 'employmentInformations'
      });

      // Association with Vacancy
      EmploymentStatus.hasMany(models.Vacancy, {
        foreignKey: 'employmentId',
        as: 'vacancies'
      });

      // Association with EmploymentHistory
      EmploymentStatus.hasMany(models.EmploymentHistory, {
        foreignKey: 'employmentId',
        as: 'employmentHistories'
      });
    }
  }
  EmploymentStatus.init({
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
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'EmploymentStatus',
    tableName: 'EmploymentStatuses',
    timestamps: true,
  });
  return EmploymentStatus;
};