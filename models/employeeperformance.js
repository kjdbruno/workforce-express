'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeePerformance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmployeePerformance.init({
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
    ReviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles', // Assuming you have a Profiles table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    StartDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false
    },
    EndDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false
    },
    Comments: {
      type: DataTypes.TEXT('long'), // Use TEXT for long text fields
      allowNull: true // Allow null if comments are optional
    },
    Status: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending' // Default status
    }
  }, {
    sequelize,
    modelName: 'EmployeePerformance',
    tableName: 'employeeperformances', // Specify the table name
    timestamps: true, // Enable timestamps
  });
  return EmployeePerformance;
};