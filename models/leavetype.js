'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeaveType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming LeaveType has many EmployeeLeaveApplications
      // This allows you to access the EmployeeLeaveApplications associated with a LeaveType instance
      LeaveType.hasMany(models.EmployeeLeaveApplication, {
        foreignKey: 'LeaveTypeId',
        as: 'EmployeeLeaveApplications',
      });

      // Assuming LeaveType has many EmployeeLeaveCredits
      // This allows you to access the EmployeeLeaveCredits associated with a LeaveType instance
      LeaveType.hasMany(models.EmployeeLeaveCredit, {
        foreignKey: 'LeaveTypeId',
        as: 'EmployeeLeaveCredits',
      });
    }
  }
  LeaveType.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Credit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    InDay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'LeaveType',
    tableName: 'leavetypes', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return LeaveType;
};