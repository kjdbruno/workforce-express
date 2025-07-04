'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeScores', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PerformanceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EmployeePerformances', // Assuming you have an EmployeePerformances table
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      CriteriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PerformanceCriteria', // Assuming you have a PerformanceCriteria table
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Score: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0, // Assuming score cannot be negative
          max: 5 // Assuming score cannot exceed 5
        }
      },
      Remarks: {
        type: Sequelize.TEXT('long'), // Use TEXT for long text fields
        allowNull: true // Allow null if remarks are optional
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
    await queryInterface.dropTable('EmployeeScores');
  }
};