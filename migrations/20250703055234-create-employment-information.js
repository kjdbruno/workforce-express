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
      biometricNo: {
        type: Sequelize.STRING,
        allowNull: true,
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
      positionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Positions',
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
    await queryInterface.addIndex('EmploymentInformations', ['biometricNo']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('EmploymentInformations', ['employeeNo']);
    await queryInterface.removeIndex('EmploymentInformations', ['biometricNo']);
    await queryInterface.dropTable('EmploymentInformations');
  }
};