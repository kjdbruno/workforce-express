'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payroll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payroll.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    payroll_period_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PayrollPeriods',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    basic_salary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    gross_pay: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    total_deductions: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    net_pay: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Generated', 'Posted'),
      allowNull: false,
      defaultValue: 'Generated'
    },
  }, {
    sequelize,
    modelName: 'Payroll',
    tableName: 'Payrolls',
    timestamps: true
  });
  return Payroll;
};