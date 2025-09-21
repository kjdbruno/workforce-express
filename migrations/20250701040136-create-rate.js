'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      salaryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Salaries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stepId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Increments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      monthlyCompensation: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      dailyCompensation: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      hourlyCompensation: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rates');
  }
};