'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GovernmentPhilhealth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GovernmentPhilhealth.init({
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
    premium_rate: {
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
    monthly_premium: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'GovernmentPhilhealth',
    tableName: 'GovernmentPhilhealths',
    timestamps: true
  });
  return GovernmentPhilhealth;
};