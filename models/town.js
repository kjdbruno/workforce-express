'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Town extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Profile
      Town.hasMany(models.Profile, {
        foreignKey: 'townId',
        as: 'profiles'
      });

      // Association with Province
      Town.belongsTo(models.Province, {
        foreignKey: 'provinceId',
        as: 'province'
      });

      // Association with Barangay
      Town.hasMany(models.Barangay, {
        foreignKey: 'townId',
        as: 'barangays'
      });
    }
  }
  Town.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    provinceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Provinces',
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
    modelName: 'Town',
    tableName: 'Towns',
    timestamps: true
  });
  return Town;
};