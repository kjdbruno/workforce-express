'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmploymentLogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmploymentLogs.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    EmploymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmploymentInformations', // Assuming you have an EmploymentInformations table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    LogDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    LogTime: {
      type: DataTypes.TIME, // Use TIME for time without date
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'EmploymentLogs',
    tableName: 'employmentlogs', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EmploymentLogs;
};