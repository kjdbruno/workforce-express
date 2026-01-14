'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.hasMany(models.ApplicantEducation, {
        foreignKey: 'course_id',
        as: 'applicantEducations'
      });

      Course.hasMany(models.EmployeeEducation, {
        foreignKey: 'course_id',
        as: 'employeeEducations'
      });
    }
  }
  Course.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'Courses',
    timestamps: true
  });
  return Course;
};