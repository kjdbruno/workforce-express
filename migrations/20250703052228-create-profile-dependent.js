'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProfileDependents', {
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
      relationshipId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Relationships',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      middlename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      suffix: {
        type: Sequelize.STRING,
        allowNull: true
      },
      birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: false
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
    await queryInterface.addIndex('ProfileDependents', ['firstname']);
    await queryInterface.addIndex('ProfileDependents', ['middlename']);
    await queryInterface.addIndex('ProfileDependents', ['lastname']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ProfileDependents', ['firstname']);
    await queryInterface.removeIndex('ProfileDependents', ['middlename']);
    await queryInterface.removeIndex('ProfileDependents', ['lastname']);
    await queryInterface.dropTable('ProfileDependents');
  }
};