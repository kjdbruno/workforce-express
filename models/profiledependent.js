'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileDependent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileDependent.init({
    ProfileId: DataTypes.INTEGER,
    RelationshipId: DataTypes.INTEGER,
    Firstname: DataTypes.INTEGER,
    Middlename: DataTypes.STRING,
    Lastname: DataTypes.STRING,
    Suffix: DataTypes.STRING,
    Birthdate: DataTypes.DATE,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ProfileDependent',
  });
  return ProfileDependent;
};