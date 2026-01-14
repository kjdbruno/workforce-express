'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeLeaveBalance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmployeeLeaveBalance.init({
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
    leave_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LeaveTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    earned: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    used: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'EmployeeLeaveBalance',
    tableName: 'EmployeeLeaveBalances',
    timestamps: true
  });
  return EmployeeLeaveBalance;
};