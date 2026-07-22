'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GovernmentTaxes', {
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
      tax_status: {
        type: Sequelize.ENUM('S', 'ME', 'S1', 'S2', 'S3', 'S4', 'ME1', 'ME2', 'ME3', 'ME4', 'Z'),
        allowNull: false
      },
      range_from: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      range_to: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      base_tax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      excess_rate: {
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
    await queryInterface.dropTable('GovernmentTaxes');
  }
};