'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalarySchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // SalarySchedule → Employee (many-to-one)
      SalarySchedule.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });

      // SalarySchedule → Position (many-to-one)
      SalarySchedule.belongsTo(models.Position, {
        foreignKey: 'position_id',
        as: 'position'
      });
    }
  }
  SalarySchedule.init({
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
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    salary_type: {
      type: DataTypes.ENUM('Monthly', 'Daily', 'Hourly'),
      allowNull: false
    },
    salary_group: {
      type: DataTypes.ENUM('HIRE', 'PROMO', 'MERIT', 'ANNUAL', 'COLA', 'PROB', 'ADJUST', 'GOVT'),
      allowNull: false
      /**
       * HIRE = Hiring Rate
       * PROMO = Promotion Increase
       * MERIT = Merit Increase
       * ANNUAL = Annual Increase
       * COLA = Cost of Living Allowance
       * PROB = Probationary Increase
       * ADJUST = Salary Adjustment
       * GOVT = Government Mandated Increase
       */
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    is_premium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'SalarySchedule',
    tableName: 'SalarySchedules',
    timestamps: true
  });
  return SalarySchedule;
};