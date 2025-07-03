'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Barangays', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TownCode: {
        type: Sequelize.STRING,
      },
      BarangayCode: {
        type: Sequelize.STRING
      },
      Name: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Barangays');
  }
};