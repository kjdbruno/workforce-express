'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProfileDependents', {
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
      RelationshipId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Relationships',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Middlename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Lastname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Suffix: {
        type: Sequelize.STRING,
        allowNull: true
      },
      Birthdate: {
        type: Sequelize.DATEONLY,
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
    await queryInterface.dropTable('ProfileDependents');
  }
};