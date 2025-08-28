'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vacancy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Vacancy.init({
    PositionId: DataTypes.INTEGER,
    CompanyId: DataTypes.INTEGER,
    DepartmentId: DataTypes.INTEGER,
    ScheduleId: DataTypes.INTEGER,
    DateNeeded: DataTypes.DATE,
    Location: DataTypes.STRING,
    Movement: DataTypes.STRING,
    Justification: DataTypes.STRING,
    NeedBackgroundCheck: DataTypes.BOOLEAN,
    SexId: DataTypes.INTEGER,
    AgeRange: DataTypes.STRING,
    EducationId: DataTypes.INTEGER,
    YearExperience: DataTypes.INTEGER,
    AppointmentId: DataTypes.INTEGER,
    Status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Vacancy',
  });
  return Vacancy;
};