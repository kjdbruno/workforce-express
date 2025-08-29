'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Barangays', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      townCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      barangayCode: {
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
    await queryInterface.addIndex('Barangays', ['townCode']);
    await queryInterface.addIndex('Barangays', ['name']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Barangays', ['townCode']);
    await queryInterface.removeIndex('Barangays', ['name']);
    await queryInterface.dropTable('Barangays');
  }
};