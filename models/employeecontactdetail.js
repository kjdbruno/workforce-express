'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeContactDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmployeeContactDetail.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ProfileId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Profiles', // Assuming you have a Profile model
        key: 'Id',
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
    },
    ContactNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
    },
  }, {
    sequelize,
    modelName: 'EmployeeContactDetail',
    tableName: 'employeecontactdetails', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EmployeeContactDetail;
};