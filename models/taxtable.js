'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaxTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming TaxTable has a foreign key TaxTableId in EmploymentInformation
      // This allows you to access the EmploymentInformation associated with a TaxTable instance
      TaxTable.hasMany(models.EmploymentInformation, {
        foreignKey: 'TaxTableId',
        as: 'EmploymentInformation',
      });
    }
  }
  TaxTable.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    IncomeStart: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    IncomeEnd: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    AdditionalAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'TaxTable',
    tableName: 'taxtables', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return TaxTable;
};