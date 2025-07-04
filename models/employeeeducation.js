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

      // Assuming EmployeeEducation has a foreign key ProfileId in Profile
      // This allows you to access the Profile associated with an EmployeeEducation instance
      EmployeeEducation.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Profile',
      });

      // Assuming EmployeeEducation has a foreign key SchoolLevelId in SchoolLevel
      // This allows you to access the SchoolLevel associated with an EmployeeEducation instance
      EmployeeEducation.belongsTo(models.SchoolLevel, {
        foreignKey: 'SchoolLevelId',
        as: 'SchoolLevel',
      });

      // Assuming EmployeeEducation has a foreign key SchoolId in School
      // This allows you to access the School associated with an EmployeeEducation instance
      EmployeeEducation.belongsTo(models.School, {
        foreignKey: 'SchoolId',
        as: 'School',
      });

      // Assuming EmployeeEducation has a foreign key CourseId in Course
      // This allows you to access the Course associated with an EmployeeEducation instance
      EmployeeEducation.belongsTo(models.Course, {
        foreignKey: 'CourseId',
        as: 'Course',
      });
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