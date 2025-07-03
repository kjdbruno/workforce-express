'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmploymentDocuments', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      EmploymentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'EmploymentInformations', // Assuming you have an Employment model
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      DocumentTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'DocumentTypes', // Assuming you have a DocumentType model
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      File: {
        type: Sequelize.STRING
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable('EmploymentDocuments');
  }
};