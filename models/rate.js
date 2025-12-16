'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Salary
      Rate.belongsTo(models.Salary, {
        foreignKey: 'salaryId',
        as: 'salary'
      });

      // Associaiton with Increment
      Rate.belongsTo(models.Increment, {
        foreignKey: 'stepId',
        as: 'increment'
      });

      // Association with EmploymentInformation
      Rate.hasMany(models.EmploymentInformation, {
        foreignKey: 'rateId',
        as: 'employmentInformations'
      });

      // Associa5tion with EmploymentHistory
      Rate.hasMany(models.EmploymentHistory, {
        foreignKey: 'rateId',
        as: 'employmentHistories'
      });
    }
  }
  Rate.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    salaryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Salaries',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    stepId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Increments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    monthlyCompensation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dailyCompensation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    hourlyCompensation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Rate',
    tableName: 'Rates',
    timestamps: true
  });
  return Rate;
};