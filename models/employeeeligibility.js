'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeEligibility extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmployeeEligibility.init({
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
    EligibilityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EligibilityTypes', // Assuming you have an Eligibilities table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    ExaminationDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    Rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    LicenseNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'EmployeeEligibility',
    tableName: 'employeeeligibilities', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EmployeeEligibility;
};