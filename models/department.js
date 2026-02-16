'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Department.hasMany(models.Employment, {
        foreignKey: 'department_id',
        as: 'employments'
      });

      // Department → Positions
      Department.hasMany(models.Position, {
        foreignKey: 'department_id',
        as: 'positions'
      });
    }
  }
  Department.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Deoartment',
    tableName: 'Departments',
    timestamps: true
  });
  return Department;
};