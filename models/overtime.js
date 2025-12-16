'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Overtime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Overtime Request
      Overtime.hasMany(models.OvertimeRequest, {
        foreignKey: 'overtimeId',
        as: 'requests'
      });

      // Association with ProfileOvertime
      Overtime.hasMany(models.ProfileOvertime, { 
        foreignKey: 'overtimeId', 
        as: 'profiles' 
      });
    }
  }
  Overtime.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    timeStart: {
      type: DataTypes.TIME,
      allowNull: false
    },
    timeEnd: {
      type: DataTypes.TIME,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Overtime',
    tableName: 'Overtimes',
    timestamps: true
  });
  return Overtime;
};