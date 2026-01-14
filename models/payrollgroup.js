'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PayrollGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PayrollGroup.hasMany(models.Employment, {
        foreignKey: 'payroll_group_id',
        as: 'employments'
      });
    }
  }
  PayrollGroup.init({
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
    cycle: {
      type: DataTypes.ENUM('Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'PayrollGroup',
    tableName: 'PayrollGroups',
    timestamps: true
  });
  return PayrollGroup;
};