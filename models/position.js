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

      // Association with PositionQualification
      Position.hasMany(models.PositionQualification, {
        foreignKey: 'positionId',
        as: 'qualifications'
      });

      // Association with Salary
      Position.hasMany(models.Salary, {
        foreignKey: 'positionId',
        as: 'salary'
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
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Position',
    tableName: 'Positions',
    timestamps: true
  });
  return Position;
};