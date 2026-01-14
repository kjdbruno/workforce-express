'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeaveType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LeaveType.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    credit: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    loa_type: {
      type: DataTypes.ENUM('Paid', 'Unpaid'),
      allowNull: false
    },
    annual_limit: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    can_carry_over: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    affects_payroll: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'LeaveType',
    tableName: 'LeaveTypes',
    timestamps: true
  });
  return LeaveType;
};