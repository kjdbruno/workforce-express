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

      // Assuming EmployeeLeaveApplication has a foreign key ProfileId in Profile
      // This allows you to access the Profile associated with an EmployeeLeaveApplication instance
      EmployeeLeaveApplication.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Profile',
      });

      // Assuming EmployeeLeaveApplication has a foreign key LeaveTypeId in LeaveType
      // This allows you to access the LeaveType associated with an EmployeeLeaveApplication instance
      EmployeeLeaveApplication.belongsTo(models.LeaveType, {
        foreignKey: 'LeaveTypeId',
        as: 'LeaveType',
      });
    }
  }
  EmployeeLeaveApplication.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles', // Assuming you have a Profiles table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    LeaveTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LeaveTypes', // Assuming you have a LeaveTypes table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    Reason: {
      type: DataTypes.TEXT('long'), // Use TEXT for long text fields
      allowNull: true, // Allow null if reason is optional
    },
    FiledOn: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    StartDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    Status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
      defaultValue: 'Pending',
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'EmployeeLeaveApplication',
  });
  return EmployeeLeaveApplication;
};