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
        type: Sequelize.ENUM('Vacant', 'Requested', 'Filled'),
        defaultValue: 'Vacant'
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
    await queryInterface.addIndex('Positions', ['name']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Positions', ['name']);
    await queryInterface.dropTable('Positions');
  }
};