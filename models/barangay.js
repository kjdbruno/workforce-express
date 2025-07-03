'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Barangay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Barangay.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TownCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    BarangayCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure BarangayCode is unique
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Barangay',
    tableName: 'barangays',
    timestamps: true,
  });
  return Barangay;
};