'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TaxTables', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IncomeStart: {
        type: Sequelize.FLOAT
      },
      IncomeEnd: {
        type: Sequelize.FLOAT
      },
      AdditionalAmount: {
        type: Sequelize.FLOAT
      },
      Percentage: {
        type: Sequelize.FLOAT
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true // Default value for IsActive
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
    await queryInterface.dropTable('TaxTables');
  }
};