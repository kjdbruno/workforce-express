'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeLeaveApplications', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ProfileId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Profiles', // Assuming you have a Profiles table
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      LeaveTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'LeaveTypes', // Assuming you have a LeaveTypes table
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      Reason: {
        type: Sequelize.TEXT('long') // Use TEXT for long text fields
      },
      FiledOn: {
        type: Sequelize.DATEONLY // Use DATEONLY for date without time
      },
      StartDate: {
        type: Sequelize.DATEONLY // Use DATEONLY for date without time
      },
      EndDate: {
        type: Sequelize.DATEONLY // Use DATEONLY for date without time
      },
      Status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
        defaultValue: 'Pending'
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
    await queryInterface.dropTable('EmployeeLeaveApplications');
  }
};