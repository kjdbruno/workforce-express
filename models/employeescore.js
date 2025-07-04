'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeScore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EmployeeScore has a foreign key PerformanceId in EmployeePerformance
      // This allows you to access the EmployeePerformance associated with an EmployeeScore instance
      EmployeeScore.belongsTo(models.EmployeePerformance, {
        foreignKey: 'PerformanceId',
        as: 'Performance',
      });

      // Assuming EmployeeScore has a foreign key CriteriaId in PerformanceCriteria
      // This allows you to access the PerformanceCriteria associated with an EmployeeScore instance
      EmployeeScore.belongsTo(models.PerformanceCriteria, {
        foreignKey: 'CriteriaId',
        as: 'Criteria',
      });
    }
  }
  EmployeeScore.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    PerformanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmployeePerformances', // Assuming you have an EmployeePerformances table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    CriteriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PerformanceCriteria', // Assuming you have a PerformanceCriteria table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    Score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0, // Assuming score cannot be negative
        max: 5 // Assuming score cannot exceed 5
      }
    },
    Remarks: {
      type: DataTypes.TEXT('long'), // Use TEXT for long text fields
      allowNull: true // Allow null if remarks are optional
    },
  }, {
    sequelize,
    modelName: 'EmployeeScore',
    tableName: 'employeescores', // Specify the table name
    timestamps: true, // Enable timestamps
  });
  return EmployeeScore;
};