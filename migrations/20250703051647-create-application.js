'use strict';

const { Position } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applications', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ProfileId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Profiles', // Assuming you have a Profiles table
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      PositionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Positions', // Assuming you have a Position model
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      Status: {
        type: Sequelize.ENUM('Pooling', 'Hired', 'Rejected', 'Withdrawn'),
        defaultValue: 'Pooling' // Default status for new applications
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
    await queryInterface.dropTable('Applications');
  }
};