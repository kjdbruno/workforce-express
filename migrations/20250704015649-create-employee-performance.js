'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeePerformances', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ProfileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profiles', // Assuming you have a Profiles table
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ReviewerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profiles', // Assuming you have a Profiles table
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      StartDate: {
        type: Sequelize.DATEONLY, // Use DATEONLY for date without time
        allowNull: false
      },
      EndDate: {
        type: Sequelize.DATEONLY, // Use DATEONLY for date without time
        allowNull: false
      },
      Comments: {
        type: Sequelize.TEXT('long'), // Use TEXT for long text fields
        allowNull: true // Allow null if comments are optional
      },
      Status: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending' // Default status
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
    await queryInterface.dropTable('EmployeePerformances');
  }
};