'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trainings', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: false // Ensure that the training name is required
      },
      Description: {
        type: Sequelize.TEXT('long'), // Use TEXT for long descriptions
        allowNull: true // Allow null if description is optional
      },
      Location: {
        type: Sequelize.STRING,
        allowNull: true // Allow null if location is optional
      },
      StartDate: {
        type: Sequelize.DATEONLY, // Use DATEONLY for date without time
        allowNull: false
      },
      EndDate: {
        type: Sequelize.DATEONLY, // Use DATEONLY for date without time
        allowNull: false
      },
      Nours: {
        type: Sequelize.FLOAT
      },
      Type: {
        type: Sequelize.ENUM('Technical', 'Supervisory', 'Managerial'), // ENUM for training type
        allowNull: false // Ensure that the training type is required
      },
      ConductedBy: {
        type: Sequelize.STRING
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true // Default to active
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
    await queryInterface.dropTable('Trainings');
  }
};