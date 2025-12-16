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

      // Association with ProfileLeave (Leave Credit)
      LeaveType.hasMany(models.ProfileLeave, {
        foreignKey: 'typeId',
        as: 'leaveCredits'
      });
    }
  }
  LeaveType.init({
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
    credit: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    accrual: {
      type: DataTypes.ENUM('Yearly', 'Monthly', 'Daily'),
      allowNull: false
    },
    carryOver: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'LeaveType',
    tableName: 'LeaveTypes',
    timestamps: true
  });
  return LeaveType;
};