'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GovernmentSocialSecuritySystem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GovernmentSocialSecuritySystem.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    effectivity_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    range_from: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    range_to: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    monthly_salary_credit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    employee_share: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    employer_share: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    ec_contribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total_deduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'GovernmentSocialSecuritySystem',
    tableName: 'GovernmentSocialSecuritySystems',
    timestamps: true
  });
  return GovernmentSocialSecuritySystem;
};