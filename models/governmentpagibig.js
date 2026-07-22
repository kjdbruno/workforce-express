'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GovernmentPagibig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GovernmentPagibig.init({
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
      type: DataTypes.DECIMA(10, 2),
      allowNull: false
    },
    range_to: {
      type: DataTypes.DECIMA(10, 2),
      allowNull: false
    },
    employee_rate: {
      type: DataTypes.DECIMA(10, 2),
      allowNull: false
    },
    employer_rate: {
      type: DataTypes.DECIMA(10, 2),
      allowNull: false
    },
    employee_share: {
      type: DataTypes.DECIMA(10, 2),
      allowNull: false
    },
    employer_share: {
      type: DataTypes.DECIMA(10, 2),
      allowNull: false
    },
    max_contribution: {
      type: DataTypes.DECIMA(10, 2),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'GovernmentPagibig',
    tableName: 'GovernmentPagibigs',
    timestamps: true
  });
  return GovernmentPagibig;
};