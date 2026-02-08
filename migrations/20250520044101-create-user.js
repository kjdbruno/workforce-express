'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
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
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('SuperAdmin', 'Admin', 'Management', 'HR', 'Finance', 'Employee'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive', 'Suspended'),
        allowNull: false
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastFailedLogin: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.addIndex('Users', ['username']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Users', ['username']);
    await queryInterface.dropTable('Users');
  }
};