'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ApplicationDocuments', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ApplicationId: {
        type: Sequelize.INTEGER,
        reference: {
          model: 'Applications', // Assuming the Applications table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      DocumentTypeId: {
        type: Sequelize.INTEGER,
        reference: {
          model: 'DocumentTypes', // Assuming the DocumentTypes table exists
          key: 'Id'
        },
        onDelete: 'SET NULL', // Optional: define behavior on delete
        onUpdate: 'SET NULL' // Optional: define behavior on update
      },
      File: {
        type: Sequelize.STRING
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true // Default value for IsActive
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ApplicationDocuments');
  }
};