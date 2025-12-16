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

      // Association with Profile
      Barangay.hasMany(models.Profile, {
        foreignKey: 'barangayId',
        as: 'profiles'
      });

      // Association with Town
      Barangay.belongsTo(models.Town, {
        foreignKey: 'townId',
        as: 'town'
      });
    }
  }
  Barangay.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    townId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Towns',
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
    modelName: 'Barangay',
    tableName: 'Barangays',
    timestamps: true
  });
  return Barangay;
};