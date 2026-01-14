  'use strict';
  const {
    Model
  } = require('sequelize');
  module.exports = (sequelize, DataTypes) => {
    class Employee extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
        // define association here
        // Employee → EmployeeAccount
        Employee.hasOne(models.EmployeeAccount, {
          foreignKey: 'employee_id',
          as: 'account'
        });

        // Employee → Employment
        Employee.hasOne(models.Employment, {
          foreignKey: 'employee_id',
          as: 'employment'
        });

        // Employee → SalarySchedule (one-to-many)
        Employee.hasMany(models.SalarySchedule, {
          foreignKey: 'employee_id',
          as: 'salarySchedules'
        });

        // Employee → Documents
        Employee.hasMany(models.EmployeeDocument, {
          foreignKey: 'employee_id',
          as: 'documents'
        });
        // Employee → Education
        Employee.hasMany(models.EmployeeEducation, {
          foreignKey: 'employee_id',
          as: 'educations'
        });
        // Employee → Work Experience
        Employee.hasMany(models.EmployeeExperience, {
          foreignKey: 'employee_id',
          as: 'experiences'
        });
        // Employee → Trainings
        Employee.hasMany(models.EmployeeTraining, {
          foreignKey: 'employee_id',
          as: 'trainings'
        });
      }
    }
    Employee.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      middle_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      suffix: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sex: {
        type: DataTypes.ENUM('Male', 'Female'),
        allowNull: false
      },
      civil_status: {
        type: DataTypes.ENUM('Single', 'Married', 'Widowed', 'Divorced', 'Separated'),
        allowNull: false
      },
      blood_type: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: false
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      birthplace: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: false
      },
    }, {
      sequelize,
      modelName: 'Employee',
      tableName: 'Employees',
      timestamps: true
    });
    return Employee;
  };