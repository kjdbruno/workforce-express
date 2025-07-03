'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rates', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      SalaryClassId: {
        type: Sequelize.INTEGER
      },
      SalaryGradeId: {
        type: Sequelize.INTEGER
      },
      IncreaseInDay: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('Rates');
  }
};