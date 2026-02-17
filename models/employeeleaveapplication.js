'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeLeaveApplication extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Leave Application → Employee
      EmployeeLeaveApplication.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });

      // Leave Application → Leave Type
      EmployeeLeaveApplication.belongsTo(models.LeaveType, {
        foreignKey: 'leave_type_id',
        as: 'leaveType'
      });
    }
  }
  EmployeeLeaveApplication.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    control_no: {
      type: DataTypes.STRING,
      allowNull: false
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
    leave_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LeaveTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    date_from: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_to: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Filed', 'Approved', 'Rejected', 'Cancelled'),
      defaultValue: 'Pending'
    },
  }, {
    sequelize,
    modelName: 'EmployeeLeaveApplication',
    tableName: 'EmployeeLeaveApplications',
    timestamps: true
  });
  return EmployeeLeaveApplication;
};