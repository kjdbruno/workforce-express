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

      // Association with EmploymentSchedfule
      ScheduleShift.hasMany(models.EmploymentSchedule, {
        foreignKey: 'shiftId',
        as: 'employmentSchedules'
      });

      // Association with ScheduleClass
      ScheduleShift.belongsTo(models.ScheduleClass, {
        foreignKey: 'classId',
        as: 'class'
      });

      // Association with Vacancy
      ScheduleShift.hasMany(models.Vacancy, {
        foreignKey: 'shiftId',
        as: 'vacancies'
      });
    }
  }
  ScheduleShift.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ScheduleClasses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    timeStart: {
      type: DataTypes.TIME,
      allowNull: false
    },
    timeEnd: {
      type: DataTypes.TIME,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'ScheduleShift',
    tableName: 'ScheduleShifts',
    timestamps: true
  });
  return ScheduleShift;
};