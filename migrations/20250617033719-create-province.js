'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Provinces', {
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
      provinceCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
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
    await queryInterface.addIndex('Provinces', ['regionCode']);
    await queryInterface.addIndex('Provinces', ['provinceCode']);
    await queryInterface.addIndex('Provinces', ['name']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Provinces', ['regionCode']);
    await queryInterface.removeIndex('Provinces', ['provinceCode']);
    await queryInterface.removeIndex('Provinces', ['name']);
    await queryInterface.dropTable('Provinces');
  }
};