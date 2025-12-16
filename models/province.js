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

      // Association with Profile
      Province.hasMany(models.Profile, {
        foreignKey: 'provinceId',
        as: 'profiles'
      });

      // Association with Regions
      Province.belongsTo(models.Region, {
        foreignKey: 'regionId',
        as: 'region'
      });

      // Association with Towns
      Province.hasMany(models.Town, {
        foreignKey: 'provinceId',
        as: 'towns'
      });
    }
  }
  Province.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    regionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Regions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    modelName: 'Province',
    tableName: 'Provinces',
    timestamps: true
  });
  return Province;
};