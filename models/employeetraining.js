'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeTraining extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EmployeeTraining has a foreign key ProfileId in Profile
      // This allows you to access the Profile associated with an EmployeeTraining instance
      EmployeeTraining.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Employee',
      });

      // Assuming EmployeeTraining has a foreign key TrainingId in Training
      // This allows you to access the Training associated with an EmployeeTraining instance
      EmployeeTraining.belongsTo(models.Training, {
        foreignKey: 'TrainingId',
        as: 'Training',
      });
    }
  }
  EmployeeTraining.init({
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
    TrainingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Trainings', // Assuming you have a Trainings table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    File: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null if file is optional
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default to active
    },
  }, {
    sequelize,
    modelName: 'EmployeeTraining',
    tableName: 'employeetrainings', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EmployeeTraining;
};