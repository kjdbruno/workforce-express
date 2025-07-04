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

      // Assuming Course has many EmployeeEducation
      // This allows you to access the EmployeeEducation associated with a Course instance
      Course.hasMany(models.EmployeeEducation, {
        foreignKey: 'CourseId',
        as: 'EmployeeEducation',
      });
    }
  }
  Course.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Alias: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'courses', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Course;
};