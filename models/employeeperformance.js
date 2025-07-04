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

      // Assuming EmployeePerformance belongs to Profile
      // This allows you to access the Profile associated with an EmployeePerformance instance
      EmployeePerformance.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Employee',
      });

      // Assuming EmployeePerformance has a foreign key ReviewerId in Profile
      // This allows you to access the Reviewer associated with an EmployeePerformance instance
      EmployeePerformance.belongsTo(models.Profile, {
        foreignKey: 'ReviewerId',
        as: 'Reviewer',
      });

      // Assuming EmployeePerformance has many EmployeeScores
      // This allows you to access the EmployeeScores associated with an EmployeePerformance instance
      EmployeePerformance.hasMany(models.EmployeeScore, {
        foreignKey: 'PerformanceId',
        as: 'Scores',
      });
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