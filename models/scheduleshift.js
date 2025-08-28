'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScheduleShift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ScheduleShift.init({
    ClassId: DataTypes.INTEGER,
    TimeStart: DataTypes.TIME,
    TimeEnd: DataTypes.TIME,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ScheduleShift',
  });
  return ScheduleShift;
};