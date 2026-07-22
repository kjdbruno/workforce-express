'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GovernmentPhilhealths', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      effectivity_year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      range_from: {
        type: Sequelize.DECIMA(10, 2),
        allowNull: false
      },
      range_to: {
        type: Sequelize.DECIMA(10, 2),
        allowNull: false
      },
      premium_rate: {
        type: Sequelize.DECIMA(10, 2),
        allowNull: false
      },
      employee_share: {
        type: Sequelize.DECIMA(10, 2),
        allowNull: false
      },
      employer_share: {
        type: Sequelize.DECIMA(10, 2),
        allowNull: false
      },
      monthly_premium: {
        type: Sequelize.DECIMA(10, 2),
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GovernmentPhilhealths');
  }
};