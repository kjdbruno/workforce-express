'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PositionQualification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PositionQualification.init({
    PositionId: DataTypes.INTEGER,
    Qualification: DataTypes.STRING,
    IsActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'PositionQualification',
  });
  return PositionQualification;
};