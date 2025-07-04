'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BloodType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming BloodType has a foreign key BloodTypeId in Profile
      // This allows you to access the Profiles associated with a BloodType instance
      BloodType.hasMany(models.Profile, {
        foreignKey: 'BloodTypeId',
        as: 'Profiles',
      });
    }
  }
  BloodType.init({
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
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'BloodType',
    tableName: 'bloodtypes',
    timestamps: true,
  });
  return BloodType;
};