'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProfileTrainings', {
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
          model: 'Profiles',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Title: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      StartDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      EndDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      Hour: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      Type: {
        type: Sequelize.ENUM(
          'Technical',        // job-related skills
          'Managerial',       // supervisory / leadership
          'Supervisory',      // for mid-level managers
          'Mandatory',        // required by CSC/agency
          'Orientation',      // onboarding / induction
          'Seminar',          // short learning sessions
          'Workshop',         // hands-on practical training
          'Conference'        // external or large event
        ),
        allowNull: false
      },
      ConductedBy: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      File: {
        type: Sequelize.TEXT('long'),
        allowNull: false
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
    await queryInterface.dropTable('ProfileTrainings');
  }
};