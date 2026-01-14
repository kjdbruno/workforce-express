'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Vacancies
      Position.hasMany(models.Vacancy, {
        foreignKey: 'position_id',
        as: 'vacancies'
      });

      Position.hasMany(models.Employment, {
        foreignKey: 'position_id',
        as: 'employments'
      });
    }
  }
  Position.init({
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
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    qualification: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Vacant', 'Requested', 'Filled'),
      defaultValue: 'Vacant'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Position',
    tableName: 'Positions',
    timestamps: true
  });
  return Position;
};