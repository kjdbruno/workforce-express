'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RateIncrement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Rate
      RateIncrement.belongsTo(models.Rate, {
        foreignKey: 'rateId',
        as: 'rate'
      });

      // Association with Increment
      RateIncrement.belongsTo(models.Increment, {
        foreignKey: 'incrementId',
        as: 'increment'
      });
      
    }
  }
  RateIncrement.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    rateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Rates',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    incrementId: {
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
    modelName: 'RateIncrement',
    tableName: 'RateIncrements',
    timestamps: true
  });
  return RateIncrement;
};