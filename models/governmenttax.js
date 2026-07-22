'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GovernmentTax extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GovernmentTax.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    effectivity_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tax_status: {
      type: DataTypes.ENUM('S', 'ME', 'S1', 'S2', 'S3', 'S4', 'ME1', 'ME2', 'ME3', 'ME4', 'Z'),
      allowNull: false
    },
    range_from: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    range_to: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    base_tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    excess_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'GovernmentTax',
    tableName: 'GovernmentTaxes',
    timestamps: true
  });
  return GovernmentTax;
};