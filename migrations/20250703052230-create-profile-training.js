'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProfileTrainings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      hour: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      type: {
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
      conductedBy: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      file: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('ProfileTrainings', ['title']);
    await queryInterface.addIndex('ProfileTrainings', ['type']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ProfileTrainings', ['title']);
    await queryInterface.removeIndex('ProfileTrainings', ['type']);
    await queryInterface.dropTable('ProfileTrainings');
  }
};