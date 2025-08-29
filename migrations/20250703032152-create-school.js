'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Schools', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      alias: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
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
    await queryInterface.addIndex('Schools', ['name']);
    await queryInterface.addIndex('Schools', ['alias']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Schools', ['name']);
    await queryInterface.removeIndex('Schools', ['alias']);
    await queryInterface.dropTable('Schools');
  }
};