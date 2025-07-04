'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaxCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming TaxCode has a foreign key TaxCodeId in EmploymentInformation
      // This allows you to access the EmploymentInformation associated with a TaxCode instance
      TaxCode.hasMany(models.EmploymentInformation, {
        foreignKey: 'TaxCodeId',
        as: 'EmploymentInformation',
      });
    }
  }
  TaxCode.init({
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
    Alias: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'TaxCode',
    tableName: 'taxcodes', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return TaxCode;
};