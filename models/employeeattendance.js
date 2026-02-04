'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeAttendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      // EmployeeAttendance → Attendance
      EmployeeAttendance.belongsTo(models.Attendance, {
        foreignKey: 'attendance_id',
        as: 'attendance'
      })

      // EmployeeAttendance → EmployeeAttendanceAdjustment
      EmployeeAttendance.hasMany(models.EmployeeAttendanceAdjustment, {
        foreignKey: 'employee_attendance_id',
        as: 'adjustments'
      });
      
    }
  }
  EmployeeAttendance.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    attendance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Attendances',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    work_day: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time_in: {
      type: DataTypes.TIME,
      allowNull: false
    },
    time_out: {
      type: DataTypes.TIME,
      allowNull: false
    },
    late_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    undertime_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    overtime_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'EmployeeAttendance',
    tableName: 'EmployeeAttendances',
    timestamps: true
  });
  return EmployeeAttendance;
};