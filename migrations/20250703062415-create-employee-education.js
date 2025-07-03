'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeEducations', {
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
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      SchoolLevelId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'SchoolLevels', // Assuming you have a SchoolLevels table
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      SchoolId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Schools', // Assuming you have a Schools table
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      CourseId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Courses', // Assuming you have a Courses table
          key: 'Id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      Rating: {
        type: Sequelize.FLOAT
      },
      StartDate: {
        type: Sequelize.DATEONLY // Use DATEONLY for date without time
      },
      EndDate: {
        type: Sequelize.DATEONLY // Use DATEONLY for date without time
      },
      Graduated: {
        type: Sequelize.INTEGER // Assuming this is a year, you might want to use Sequelize.INTEGER
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
    await queryInterface.dropTable('EmployeeEducations');
  }
};