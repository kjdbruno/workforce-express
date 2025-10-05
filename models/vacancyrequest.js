'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VacancyRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Vacancies
      VacancyRequest.belongsTo(models.Vacancy, {
        foreignKey: 'vacancyId',
        as: 'vacancy'
      });

      // Association with Signatories
      VacancyRequest.belongsTo(models.Signatory, {
        foreignKey: 'signatoryId',
        as: 'signatory'
      });
      
    }
  }
  VacancyRequest.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    vacancyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vacancies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    signatoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Signatories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved'),
      defaultValue: 'Pending'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'VacancyRequest',
  });
  return VacancyRequest;
};