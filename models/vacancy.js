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

      // Association with Position
      Vacancy.belongsTo(models.Position, {
        foreignKey: 'positionId',
        as: 'position'
      });

      // Assocition with Company
      Vacancy.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company'
      });

      // Association with Department
      Vacancy.belongsTo(models.Department, {
        foreignKey: 'departmentId',
        as: 'department'
      });

      // Assciation with ScheduleShift
      Vacancy.belongsTo(models.ScheduleShift, {
        foreignKey: 'shiftId',
        as: 'shift'
      });

      // Association with Sex
      Vacancy.belongsTo(models.Sex, {
        foreignKey: 'sexId',
        as: 'sex'
      });

      // Association with SchoolLevel
      Vacancy.belongsTo(models.SchoolLevel, {
        foreignKey: 'levelId',
        as: 'schoolLevel'
      });

      // Association with EmploymentStatus
      Vacancy.belongsTo(models.EmploymentStatus, {
        foreignKey: 'employmentId',
        as: 'employmentStatus'
      });

      // Association with Increment
      Vacancy.belongsTo(models.Increment, {
        foreignKey: 'stepId',
        as: 'increment'
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
    stepId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Increments',
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
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ScheduleShifts',
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
    yearExperience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    employmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmploymentStatuses',
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