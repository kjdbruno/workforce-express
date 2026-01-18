'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeOvertimeApplication extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Each overtime application belongs to one employee
      EmployeeOvertimeApplication.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });

      // Each overtime application belongs to one overtime schedule
      EmployeeOvertimeApplication.belongsTo(models.Overtime, {
        foreignKey: 'overtime_id',
        as: 'overtime'
      });
    }
  }
  EmployeeOvertimeApplication.init({
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
    overtime_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Overtimes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'EmployeeOvertimeApplication',
    tableName: 'EmployeeOvertimeApplications',
    timestamps: true
  });
  return EmployeeOvertimeApplication;
};