'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RateIncrements', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      RateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rates',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IncrementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Increments',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      MonthlyCompensation: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      DailyCompensation: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      HourlyCompensation: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable('RateIncrements');
  }
};