'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileFace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileFace.init({
    profileId: DataTypes.INTEGER,
    profileId: DataTypes.INTEGER,
    desciptor: DataTypes.STRING,
    imageFile: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ProfileFace',
  });
  return ProfileFace;
};