'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmploymentLogs', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      BiometricNo: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true, // Ensure BiometricId is unique
      },
      LogDate: {
        type: Sequelize.DATEONLY, // Use DATEONLY for date without time
        allowNull: false
      },
      LogTime: {
        type: Sequelize.TIME, // Use TIME for time without date
        allowNull: false
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
    await queryInterface.dropTable('EmploymentLogs');
  }
};