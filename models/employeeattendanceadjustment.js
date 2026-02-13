'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeAttendanceAdjustment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Adjustment → EmployeeAttendance
      EmployeeAttendanceAdjustment.belongsTo(models.EmployeeAttendance, {
        foreignKey: 'employee_attendance_id',
        as: 'attendance'
      });

      // Adjustment → User (who made the adjustment)
      EmployeeAttendanceAdjustment.belongsTo(models.User, {
        foreignKey: 'created_by_user_id',
        as: 'created_by'
      });
    }
  }
  EmployeeAttendanceAdjustment.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    employee_attendance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmployeeAttendances',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    adjusted_time_in: {
      type: DataTypes.TIME,
      allowNull: false
    },
    adjusted_time_out: {
      type: DataTypes.TIME,
      allowNull: false
    },
    adjusted_late_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    adjusted_undertime_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    adjusted_overtime_minutes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
  }, {
    sequelize,
    modelName: 'EmployeeAttendanceAdjustment',
    tableName: 'EmployeeAttendanceAdjustments',
    timestamps: true
  });
  return EmployeeAttendanceAdjustment;
};