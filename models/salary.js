'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Salary Class
      Salary.belongsTo(models.SalaryClass, {
        foreignKey: 'classId',
        as: 'class'
      });

      // Association with Salary Grade
      Salary.belongsTo(models.SalaryGrade, {
        foreignKey: 'gradeId',
        as: 'grade'
      });

      // Association with Rate
      Salary.hasMany(models.Rate, {
        foreignKey: 'salaryId',
        as: 'rates'
      });

      // Association with Position
      Salary.belongsTo(models.Position, {
        foreignKey: 'positionId',
        as: 'positions'
      });

      // Association with Vacancy
      Salary.hasMany(models.Vacancy, {
        foreignKey: 'salaryId',
        as: 'vacancies'
      });

      // Association with EmploymentInformation
      Salary.hasMany(models.EmploymentInformation, {
        foreignKey: 'salaryId',
        as: 'employmentInformations'
      });

      // Association with EmploymentHistory
      Salary.hasMany(models.EmploymentHistory, {
        foreignKey: 'salaryId',
        as: 'employmentHistories'
      });
    }
  }
  Salary.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SalaryClasses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    gradeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SalaryGrades',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Vacant', 'Requested', 'Approved', 'Filled'),
      defaultValue: 'Vacant'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Salary',
    tableName: 'Salaries',
    timestamps: true
  });
  return Salary;
};