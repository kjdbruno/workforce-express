'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GovernmentSocialSecuritySystems', {
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
        type: Sequelize.DDECIMAL(10, 2),
        allowNull: false
      },
      monthly_salary_credit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      employee_share: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      employer_share: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      ec_contribution: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_deduction: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable('GovernmentSocialSecuritySystems');
  }
};