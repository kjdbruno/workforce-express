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
      // Position
      Vacancy.belongsTo(models.Position, {
        foreignKey: 'position_id',
        as: 'position'
      });

      // Company
      Vacancy.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });

      // Department
      Vacancy.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department'
      });

      // Work Schedule
      Vacancy.belongsTo(models.Schedule, {
        foreignKey: 'schedule_id',
        as: 'schedule'
      });

      // Applications (Applicants who applied to this vacancy)
      Vacancy.hasMany(models.Applicant, {
        foreignKey: 'vacancy_id',
        as: 'applications'
      });

      // // Hiring Requests / Approval Workflow
      // Vacancy.hasMany(models.VacancyApproval, {
      //   foreignKey: 'vacancy_id',
      //   as: 'approvals'
      // });

      // // Final hired employee (once filled)
      // Vacancy.hasOne(models.Employee, {
      //   foreignKey: 'vacancy_id',
      //   as: 'hiredEmployee'
      // });
    }
  }
  Vacancy.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    control_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    salary_range: {
      type: DataTypes.STRING,
      allowNull: false
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Schedules',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    date_needed: {
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
    need_background_check: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    sex: {
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: false
    },
    age_range: {
      type: DataTypes.STRING,
      allowNull: true
    },
    school_level: {
      type: DataTypes.ENUM('High School', 'Vocational', 'College', 'Graduate Studies'),
      allowNull: false
    },
    year_experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    employment_status: {
      type: DataTypes.ENUM('Regular', 'Probationary', 'Contractual', 'Temporary', 'Intern'),
      allowNull: false
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