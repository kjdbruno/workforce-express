'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyTimeRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // DailyTimeRecord → EmployeeAttendance
      DailyTimeRecord.belongsTo(models.EmployeeAttendance, {
        foreignKey: 'attendance_id',
        as: 'attendance'
      });
      // DailyLog → Employee
      DailyTimeRecord.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });
    }
  }
  DailyTimeRecord.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    attendance_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'EmployeeAttendances',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'DailyTimeRecord',
    tableName: 'DailyTimeRecords',
    timestamps: true
  });
  return DailyTimeRecord;
};