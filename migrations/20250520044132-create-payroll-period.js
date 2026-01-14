'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PayrollPeriods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payroll_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PayrollGroups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_from: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      date_to: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      pay_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN'
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
    await queryInterface.dropTable('PayrollPeriods');
  }
};