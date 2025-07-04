'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CivilStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming CivilStatus has a foreign key CivilStatusId in Profile
      // This allows you to access the Profiles associated with a CivilStatus instance
      CivilStatus.hasMany(models.Profile, {
        foreignKey: 'CivilStatusId',
        as: 'Profiles',
      });
    }
  }
  CivilStatus.init({
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
    modelName: 'CivilStatus',
    tableName: 'civilstatuses',
    timestamps: true,
  });
  return CivilStatus;
};