'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeEducation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmployeeEducation.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ProfileId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Profiles', // Assuming you have a Profiles table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    SchoolLevelId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SchoolLevels', // Assuming you have a SchoolLevels table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    SchoolId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Schools', // Assuming you have a Schools table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    CourseId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Courses', // Assuming you have a Courses table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    Rating: {
      type: DataTypes.FLOAT
    },
    StartDate: {
      type: DataTypes.DATEONLY
    },
    EndDate: {
      type: DataTypes.DATEONLY
    },
    Graduated: {
      type: DataTypes.INTEGER // Assuming this is a year, you might want to use Sequelize.INTEGER
    }
  }, {
    sequelize,
    modelName: 'EmployeeEducation',
    tableName: 'employeeeducations', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EmployeeEducation;
};