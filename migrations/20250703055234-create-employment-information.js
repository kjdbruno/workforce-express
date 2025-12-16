'use strict';

const { Profile } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmploymentInformations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profiles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      employeeNo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      dateHired: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sssNo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      philhealthNo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pagibigNo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      taxCodeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TaxCodes',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Departments',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      salaryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Salaries',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      rateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rates',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      employmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EmploymentStatuses',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      appointmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'AppointmentStatuses',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      shiftId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ScheduleShifts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('EmploymentInformations', ['employeeNo']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('EmploymentInformations', ['employeeNo']);
    await queryInterface.dropTable('EmploymentInformations');
  }
};