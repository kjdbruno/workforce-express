'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Training extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming Training has many EmployeeTraining
      // This allows you to access the EmployeeTraining associated with a Training instance
      Training.hasMany(models.EmployeeTraining, {
        foreignKey: 'TrainingId',
        as: 'EmployeeTrainings',
      });
    }
  }
  Training.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false, // Ensure that the training name is required
    },
    Description: {
      type: DataTypes.TEXT('long'), // Use TEXT for long descriptions
      allowNull: true, // Allow null if description is optional
    },
    Location: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null if location is optional
    },
    StartDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    Nours: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Type: {
      type: DataTypes.ENUM('Technical', 'Supervisory', 'Managerial'), // ENUM for training type
      allowNull: false, // Ensure that the training type is required
    },
    ConductedBy: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null if conducted by is optional
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default to active
    },
  }, {
    sequelize,
    modelName: 'Training',
  });
  return Training;
};