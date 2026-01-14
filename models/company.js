'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Vacancies
      Company.hasMany(models.Vacancy, {
        foreignKey: 'company_id',
        as: 'vacancies'
      });

      Company.hasMany(models.Employment, {
        foreignKey: 'company_id',
        as: 'employments'
      });
    }
  }
  Company.init({
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
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'Companies',
    timestamps: true
  });
  return Company;
};