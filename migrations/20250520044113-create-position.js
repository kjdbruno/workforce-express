'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Positions', {
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
      monthly_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      daily_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      hourly_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      salary_type: {
        type: Sequelize.ENUM('Monthly', 'Daily', 'Hourly'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      qualification: {
        type: Sequelize.JSON,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Vacant', 'Requested', 'Approved', 'Filled'),
        defaultValue: 'Vacant'
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
    await queryInterface.addIndex('Positions', ['name']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Positions', ['name']);
    await queryInterface.dropTable('Positions');
  }
};