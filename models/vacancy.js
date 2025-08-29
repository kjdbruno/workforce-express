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

      // Association with Application
      Vacancy.hasMany(models.Application, {
        foreignKey: 'vacancyId',
        as: 'applications'
      });
    }
  }
  Vacancy.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ScheduleClasses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    dateNeeded: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    movement: {
      type: DataTypes.ENUM('Addition', 'Replacement'),
      allowNull: false
    },
    justification: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    needBackgroundCheck: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    sexId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sexes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    ageRange: {
      type: DataTypes.STRING
    },
    educationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    yearExperience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AppointmentStatuses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Vacant', 'Requested', 'Approved', 'Rejected', 'Filled'),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Vacancy',
    tableName: 'Vacancies',
    timestamps: true
  });
  return Vacancy;
};