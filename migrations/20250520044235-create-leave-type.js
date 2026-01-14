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
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      credit: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      loa_type: {
        type: Sequelize.ENUM('Paid', 'Unpaid'),
        allowNull: false
      },
      annual_limit: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      can_carry_over: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      affects_payroll: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      is_active: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LeaveTypes');
  }
};