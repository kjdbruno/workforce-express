'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LeaveTypes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      credit: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      accrual: {
        type: Sequelize.ENUM('Yearly', 'Monthly', 'Daily'),
        allowNull: false
      },
      carryOver: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true // Default value for IsActive
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
    await queryInterface.addIndex('LeaveTypes', ['name']);
    await queryInterface.addIndex('LeaveTypes', ['credit']);
    await queryInterface.addIndex('LeaveTypes', ['accrual']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('LeaveTypes', ['name']);
    await queryInterface.removeIndex('LeaveTypes', ['credit']);
    await queryInterface.removeIndex('LeaveTypes', ['accrual']);
    await queryInterface.dropTable('LeaveTypes');
  }
};