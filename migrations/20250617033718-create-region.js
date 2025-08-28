'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Regions', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      RegionCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true // Default value for isActive
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
    await queryInterface.dropTable('Regions');
  }
};