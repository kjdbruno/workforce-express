'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileEducation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileEducation.init({
    ProfileId: DataTypes.INTEGER,
    LevelId: DataTypes.INTEGER,
    SchooldId: DataTypes.INTEGER,
    CourseId: DataTypes.INTEGER,
    Rating: DataTypes.FLOAT,
    StartDate: DataTypes.DATE,
    EndDate: DataTypes.DATE,
    Graduated: DataTypes.INTEGER,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ProfileEducation',
  });
  return ProfileEducation;
};