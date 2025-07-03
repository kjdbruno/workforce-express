'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeTrainings', {
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
          key: 'Id' // Foreign key reference to Profiles table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      TrainingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Trainings', // Assuming you have a Trainings table
          key: 'Id' // Foreign key reference to Trainings table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      File: {
        type: Sequelize.STRING
      },
      IsActive: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('EmployeeTrainings');
  }
};