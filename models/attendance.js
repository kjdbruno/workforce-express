'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Attendance → Employee
      Attendance.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      })

      // Attendance → EmployeeAttendance (daily records)
      Attendance.hasMany(models.EmployeeAttendance, {
        foreignKey: 'attendance_id',
        as: 'days'
      })
      
    }
  }
  Attendance.init({
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
    date_from: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_to: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Locked', 'Cancelled'),
      defaultValue: 'Pending'
    },
    locked_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Attendance',
    tableName: 'Attendances',
    timestamps: true
  });
  return Attendance;
};