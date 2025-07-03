'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Province extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Province.init({
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
    RegionCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ProvinceCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure ProvinceCode is unique
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Province',
    tableName: 'provinces', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Province;
};