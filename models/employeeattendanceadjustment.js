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
    }
  }
  EmployeeAttendanceAdjustment.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
      type: DataTypes.DATETIME,
      allowNull: false
    },
    adjusted_time_out: {
      type: DataTypes.DATETIME,
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