'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assciation with Profile
      Region.hasMany(models.Profile, {
        foreignKey: 'regionId',
        as: 'profiles'
      });

      // Association with Province
      Region.hasMany(models.Province, {
        foreignKey: 'regionId',
        as: 'provinces'
      });
    }
  }
  Region.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Region',
    tableName: 'Regions',
    timestamps: true
  });
  return Region;
};