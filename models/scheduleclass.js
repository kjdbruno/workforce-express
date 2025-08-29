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

      // Association with ScheduleShift
      ScheduleClass.hasMany(models.ScheduleShift, {
        foreignKey: 'classId',
        as: 'shifts'
      });
      
    }
  }
  ScheduleClass.init({
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'ScheduleClass',
    tableName: 'ScheduleClasses',
    timestamps: true
  });
  return ScheduleClass;
};