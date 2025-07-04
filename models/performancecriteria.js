'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PerformanceCriteria extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming PerformanceCriteria has many EmployeeScores
      // This allows you to access the EmployeeScores associated with a PerformanceCriteria instance
      PerformanceCriteria.hasMany(models.EmployeeScore, {
        foreignKey: 'CriteriaId',
        as: 'EmployeeScores',
      });
    }
  }
  PerformanceCriteria.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming Name is required
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
    },
  }, {
    sequelize,
    modelName: 'PerformanceCriteria',
    tableName: 'performancecriterias', // Specify the table name
    timestamps: true, // Enable timestamps
  });
  return PerformanceCriteria;
};