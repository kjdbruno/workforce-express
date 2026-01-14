'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PayrollDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PayrollDetail.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    payroll_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Payrolls',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    payroll_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PayrollItems',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM('Allowance', 'Deduction', 'Tax', 'Government', 'Loan', 'Other'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'PayrollDetail',
    tableName: 'PayrollDetails',
    timestamps: true
  });
  return PayrollDetail;
};