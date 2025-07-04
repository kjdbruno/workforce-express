'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeLeaveCredit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EmployeeLeaveCredit has a foreign key ProfileId in Profile
      // This allows you to access the Profile associated with an EmployeeLeaveCredit instance
      EmployeeLeaveCredit.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Profile',
      });

      // Assuming EmployeeLeaveCredit has a foreign key LeaveTypeId in LeaveType
      // This allows you to access the LeaveType associated with an EmployeeLeaveCredit instance
      EmployeeLeaveCredit.belongsTo(models.LeaveType, {
        foreignKey: 'LeaveTypeId',
        as: 'LeaveType',
      });
    }
  }
  EmployeeLeaveCredit.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ProfileId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Profiles', // Assuming you have a Profiles table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    LeaveTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'LeaveTypes', // Assuming you have a LeaveTypes table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    Credit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default value for credit
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
    },
  }, {
    sequelize,
    modelName: 'EmployeeLeaveCredit',
  });
  return EmployeeLeaveCredit;
};