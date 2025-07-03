'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmploymentHistories', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      EmploymentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EmploymentInformations', // Assuming you have an Employments table
          key: 'Id' // Foreign key reference to Employments table 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      PositionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Positions', // Assuming you have a Positions table
          key: 'Id' // Foreign key reference to Positions table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      EmploymentStatusId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EmploymentStatuses', // Assuming you have an EmploymentStatuses table
          key: 'Id' // Foreign key reference to EmploymentStatuses table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      DepartmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Departments', // Assuming you have a Departments table
          key: 'Id' // Foreign key reference to Departments table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      StartDate: {
        type: Sequelize.DATEONLY, // Use DATEONLY for date without time
      },
      EndDate: {
        type: Sequelize.DATEONLY // Use DATEONLY for date without time
      },
      Remarks: {
        type: Sequelize.TEXT('long') // Use TEXT for long text fields
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
    await queryInterface.dropTable('EmploymentHistories');
  }
};