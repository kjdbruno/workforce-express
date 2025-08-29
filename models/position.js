'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with EmploymentInformation
      Position.hasMany(models.EmploymentInformation, {
        foreignKey: 'positionId',
        as: 'employmentInformations'
      });

      // Association with PositionQualification
      Position.hasMany(models.PositionQualification, {
        foreignKey: 'positionId',
        as: 'qualifications'
      });

      // Association with Rate
      Position.hasMany(models.Rate, {
        foreignKey: 'positionId',
        as: 'rates'
      });
    }
  }
  Position.init({
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
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN
    },
  }, {
    sequelize,
    modelName: 'Position',
    tableName: 'Positions',
    timestamps: true
  });
  return Position;
};