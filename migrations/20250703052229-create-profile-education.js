'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProfileEducations', {
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
      LevelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SchoolLevels',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      SchooldId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Schools',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      CourseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Rating: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      StartDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      EndDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      Graduated: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultvALUE: TRUE
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
    await queryInterface.dropTable('ProfileEducations');
  }
};