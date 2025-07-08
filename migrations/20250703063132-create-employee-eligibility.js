'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeEligibilities', {
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
          key: 'Id' // Adjust the key based on your Profiles table definition
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      EligibilityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EligibilityTypes', // Assuming you have an Eligibilities table
          key: 'Id' // Adjust the key based on your Eligibilities table definition  
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ExaminationDate: {
        type: Sequelize.DATEONLY, // Use DATEONLY for date without time
        allowNull: false
      },
      Rating: {
        type: Sequelize.FLOAT
      },
      LicenseNo: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('EmployeeEligibilities');
  }
};