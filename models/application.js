'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Profile
      Application.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });

      // Association with Vacancy
      Application.belongsTo(models.Vacancy, {
        foreignKey: 'vacancyId',
        as: 'vacancy'
      });
    }
  }
  Application.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    status: {
      type: DataTypes.ENUM(
        'Pooling', 
        'Shortlisted', 
        'Interview', 
        'Hired', 
        'Rejected', 
        'Withdrawn'
      ),
      defaultValue: 'Pooling'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Application',
    tableName: 'Applications',
    timestamps: true
  });
  return Application;
};