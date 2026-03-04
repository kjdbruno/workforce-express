'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Vacancies
      Position.hasMany(models.Vacancy, {
        foreignKey: 'position_id',
        as: 'vacancies'
      });

      Position.hasMany(models.Employment, {
        foreignKey: 'position_id',
        as: 'employments'
      });

      // Position → Department
      Position.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department'
      });

      // Position → SalarySchedule (one-to-many)
      Position.hasMany(models.SalarySchedule, {
        foreignKey: 'position_id',
        as: 'salarySchedules'
      });
    }
  }
  Position.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      },
    },
    monthly_salary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    daily_salary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    hourly_salary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    salary_type: {
      type: DataTypes.ENUM('Monthly', 'Daily', 'Hourly'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    qualification: {
      type: DataTypes.JSON,
      allowNull: false
    },
    benefit: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Vacant', 'Requested', 'Approved', 'Filled'),
      defaultValue: 'Vacant'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Position',
    tableName: 'Positions',
    timestamps: true
  });
  return Position;
};