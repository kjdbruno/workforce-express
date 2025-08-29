'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RateIncrements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      rateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      incrementId: {
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
    await queryInterface.addIndex('RateIncrements', ['monthlyCompensation']);
    await queryInterface.addIndex('RateIncrements', ['dailyCompensation']);
    await queryInterface.addIndex('RateIncrements', ['hourlyCompensation']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('RateIncrements', ['monthlyCompensation']);
    await queryInterface.removeIndex('RateIncrements', ['dailyCompensation']);
    await queryInterface.removeIndex('RateIncrements', ['hourlyCompensation']);
    await queryInterface.dropTable('RateIncrements');
  }
};