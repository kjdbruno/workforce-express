'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RateIncrement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RateIncrement.init({
    RateId: DataTypes.INTEGER,
    IncrementId: DataTypes.INTEGER,
    MonthlyCompensation: DataTypes.FLOAT,
    DailyCompensation: DataTypes.FLOAT,
    HourlyCompensation: DataTypes.FLOAT,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'RateIncrement',
  });
  return RateIncrement;
};