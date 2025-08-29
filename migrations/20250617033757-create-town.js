'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Towns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      provinceCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      townCode: {
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
    await queryInterface.addIndex('Towns', ['provinceCode']);
    await queryInterface.addIndex('Towns', ['townCode']);
    await queryInterface.addIndex('Towns', ['name']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Towns', ['provinceCode']);
    await queryInterface.removeIndex('Towns', ['townCode']);
    await queryInterface.removeIndex('Towns', ['name']);
    await queryInterface.dropTable('Towns');
  }
};