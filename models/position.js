'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Position.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SalaryGradeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SalaryGrades', // Assuming SalaryGrades is the table name
        key: 'Id',
      },
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Position',
    tableName: 'positions', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Position;
};