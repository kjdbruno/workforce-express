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
        Employee.hasMany(models.EmployeeAccount, {
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
        // Employee → Dependents
        Employee.hasMany(models.EmployeeDependent, {
          foreignKey: 'employee_id',
          as: 'dependents'
        });
        // Employee → Leave Applications
        Employee.hasMany(models.EmployeeLeaveApplication, {
          foreignKey: 'employee_id',
          as: 'leaveApplications'
        });
        // Employee → Leave Balances
        Employee.hasMany(models.EmployeeLeaveBalance, {
          foreignKey: 'employee_id',
          as: 'leaveBalances'
        });
        // Employee → Photo
        Employee.hasOne(models.EmployeePhoto, {
          foreignKey: 'employee_id',
          as: 'photo'
        });
        // Employee → Overtime Applications
        Employee.hasMany(models.EmployeeOvertimeApplication, {
          foreignKey: 'employee_id',
          as: 'overtimeApplications'
        });

        // Inside Employee.associate(models)
        Employee.hasMany(models.EmployeeFace, {
          foreignKey: 'employee_id',
          as: 'faces' // you can access employee.faces
        });

        // Employee -> EmployeeShift
        Employee.hasMany(models.EmployeeShift, {
          foreignKey: "employee_id",
          as: "employeeShifts",
        });

        // Employee → EmployeeLogs
        Employee.hasMany(models.EmployeeLog, {
          foreignKey: 'employee_id',
          as: 'logs'
        });

        // Employee → Attendance (header)
        Employee.hasMany(models.Attendance, {
          foreignKey: 'employee_id',
          as: 'attendances'
        })

        // Employee → Signature
        Employee.hasOne(models.EmployeeSignature, {
          foreignKey: 'employee_id',
          as: 'signature'
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
        allowNull: false
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active'
      }
    }, {
      sequelize,
      modelName: 'Employee',
      tableName: 'Employees',
      timestamps: true
    });
    return Employee;
  };