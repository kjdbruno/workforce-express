'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Firstname: {
        type: Sequelize.STRING
      },
      Middlename: {
        type: Sequelize.STRING
      },
      Lastname: {
        type: Sequelize.STRING
      },
      Suffix: {
        type: Sequelize.STRING
      },
      SexId: {
        type: Sequelize.INTEGER
      },
      CivilStatusId: {
        type: Sequelize.INTEGER
      },
      Birthdate: {
        type: Sequelize.DATE
      },
      Birthplace: {
        type: Sequelize.STRING
      },
      Weight: {
        type: Sequelize.FLOAT
      },
      Height: {
        type: Sequelize.FLOAT
      },
      BloodTypeId: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Profiles');
  }
};