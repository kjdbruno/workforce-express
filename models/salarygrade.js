'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalaryGrade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming SalaryGrade has a foreign key SalaryGradeId in Position
      // This allows you to access the Positions associated with a SalaryGrade instance
      SalaryGrade.hasMany(models.Position, {
        foreignKey: 'SalaryGradeId',
        as: 'Positions',
      });

      //
      SalaryGrade.hasMany(models.Rate, {
        foreignKey: 'SalaryGradeId',
        as: 'Rates'
      });
    }
  }
  SalaryGrade.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure Name is unique
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'SalaryGrade',
    tableName: 'salarygrades', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return SalaryGrade;
};