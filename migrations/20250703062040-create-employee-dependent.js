'use strict';

const { Profile } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeDependents', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ProfileId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Profiles',
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      RelationshipId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Relationships',
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      Firstname: {
        type: Sequelize.STRING
      },
      Middlename: {
        type: Sequelize.STRING
      },
      Lastname: {
        type: Sequelize.STRING
      },
      Suffix: {
        type: Sequelize.STRING
      },
      Birthdate: {
        type: Sequelize.DATEONLY // Use DATEONLY for date without time
      },
      IsActive: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('EmployeeDependents');
  }
};