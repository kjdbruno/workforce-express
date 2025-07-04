'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalaryClass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //
      SalaryClass.hasMany(models.Rate, {
        foreignKey: 'SalaryClassId',
        as: 'Rates'
      });
    }
  }
  SalaryClass.init({
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
    modelName: 'SalaryClass',
    tableName: 'salaryclasses', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return SalaryClass;
};