'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileExperience extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileExperience.init({
    ProfileId: DataTypes.INTEGER,
    Position: DataTypes.STRING,
    JobDescription: DataTypes.STRING,
    StartDate: DataTypes.DATE,
    EndDate: DataTypes.DATE,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ProfileExperience',
  });
  return ProfileExperience;
};