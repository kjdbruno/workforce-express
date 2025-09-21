'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Increment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      // Association with Rate
      Increment.hasMany(models.Rate, {
        foreignKey: 'stepId',
        as: 'rates'
      });

      // Association with Vacancy
      Increment.hasMany(models.Vacancy, {
        foreignKey: 'stepId',
        as: 'vacancies'
      });
    }
  }
  Increment.init({
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Increment',
    tableName: 'Increments',
    timestamps: true
  });
  return Increment;
};