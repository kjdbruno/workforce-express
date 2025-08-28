'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScheduleClass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ScheduleClass.init({
    Name: DataTypes.STRING,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ScheduleClass',
  });
  return ScheduleClass;
};