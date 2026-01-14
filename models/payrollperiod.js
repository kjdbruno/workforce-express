'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PayrollPeriod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PayrollPeriod.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    payroll_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PayrollGroups',
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
    pay_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN'
    },
  }, {
    sequelize,
    modelName: 'PayrollPeriod',
    tableName: 'PayrollPeriods',
    timestamps: true
  });
  return PayrollPeriod;
};