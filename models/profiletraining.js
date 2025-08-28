'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileTraining extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileTraining.init({
    ProfileId: DataTypes.INTEGER,
    Title: DataTypes.STRING,
    StartDate: DataTypes.DATE,
    EndDate: DataTypes.DATE,
    Hour: DataTypes.FLOAT,
    Type: DataTypes.STRING,
    ConductedBy: DataTypes.STRING,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ProfileTraining',
  });
  return ProfileTraining;
};