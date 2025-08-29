'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Regions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      regionCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true // Default value for isActive
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
    await queryInterface.addIndex('Regions', ['regionCode']);
    await queryInterface.addIndex('Regions', ['name']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Regions', ['regionCode']);
    await queryInterface.removeIndex('Regions', ['name']);
    await queryInterface.dropTable('Regions');
  }
};