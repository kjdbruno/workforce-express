'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //Shift -> ShiftDay
      Shift.hasMany(models.ShiftDay, {
        foreignKey: 'shift_id',
        as: 'days'
      });

      // Shift -> Vacancy
      Shift.hasMany(models.Vacancy, {
        foreignKey: 'shift_id',
        as: 'vacancies'
      });

       // Shift -> EmployeeShift
      Shift.hasMany(models.EmployeeShift, {
        foreignKey: "shift_id",
        as: "employeeShifts",
      });
      
    }
  }
  Shift.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    break_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    grace_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    earliest_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    latest_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    crosses_midnight: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Shift',
    tableName: 'Shifts',
    timestamps: true
  });
  return Shift;
};