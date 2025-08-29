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

      // Association with Position
      Rate.belongsTo(models.Position, {
        foreignKey: 'positionId',
        as: 'position'
      });

      // Associaiton with RateIncrement
      Rate.hasMany(models.RateIncrement, {
        foreignKey: 'rateId',
        as: 'rateIncrements'
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
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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