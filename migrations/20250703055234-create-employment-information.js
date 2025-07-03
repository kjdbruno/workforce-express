'use strict';

const { Profile } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmploymentInformations', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ProfileId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Profiles', // Assuming the Profile model exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      EmployeeNo: {
        type: Sequelize.STRING,
        allowNull: false, // Assuming EmployeeNo is a required field
        unique: true // Assuming EmployeeNo should be unique
      },
      BiometricNo: {
        type: Sequelize.STRING,
        allowNull: true, // Assuming BiometricNo is optional
        unique: true // Assuming BiometricNo should be unique
      },
      DateHired: {
        type: Sequelize.DATE
      },
      Tin: {
        type: Sequelize.STRING
      },
      SSSNo: {
        type: Sequelize.STRING
      },
      PhilhealthNo: {
        type: Sequelize.STRING
      },
      PagibigNo: {
        type: Sequelize.STRING
      },
      BankAcountNo: {
        type: Sequelize.STRING
      },
      TaxCodeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TaxCodes', // Assuming the TaxCodes table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      TaxTableId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TaxTables', // Assuming the TaxTables table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete 
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      DepartmentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Departments', // Assuming the Departments table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      PositionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Positions', // Assuming the Positions table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      EmploymentStatusId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'EmploymentStatuses', // Assuming the EmploymentStatuses table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      AppointmentStatusId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'AppointmentStatuses', // Assuming the AppointmentStatuses table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      CreatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      UpdatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmploymentInformations');
  }
};