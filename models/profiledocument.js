'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileDocument.init({
    ProfileId: DataTypes.INTEGER,
    DocumentId: DataTypes.INTEGER,
    File: DataTypes.STRING,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ProfileDocument',
  });
  return ProfileDocument;
};