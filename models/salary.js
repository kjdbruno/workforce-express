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