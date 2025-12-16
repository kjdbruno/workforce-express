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

      // Association with Profile
      ProfileEducation.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });

      // Association with School
      ProfileEducation.belongsTo(models.SchoolLevel, {
        foreignKey: 'levelId',
        as: 'level'
      });

      // Association with SchoolLevel
      ProfileEducation.belongsTo(models.School, {
        foreignKey: 'schoolId',
        as: 'school'
      });

      // Association with Course
      ProfileEducation.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
    }
  }
  ProfileEducation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    levelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SchoolLevels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    graduated: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true 
    },
  }, {
    sequelize,
    modelName: 'ProfileEducation',
    tableName: 'ProfileEducations',
    timestamps: true
  });
  return ProfileEducation;
};