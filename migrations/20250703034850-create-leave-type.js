'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LeaveTypes', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Credit: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      Accrual: {
        type: Sequelize.ENUM('Yearly', 'Monthly', 'Daily'),
        allowNull: false
      },
      CarryOver: {
        type: Sequelize.BOOLEAN,
        allowNull: false
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
    await queryInterface.dropTable('LeaveTypes');
  }
};