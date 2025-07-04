'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      EmployeeNo: {
        type: Sequelize.STRING,
        allowNull: false, // Assuming EmployeeNo is a required field
        unique: true // Assuming EmployeeNo should be unique
      },
      Name: {
        type: Sequelize.STRING
      },
      Username: {
        type: Sequelize.STRING
      },
      Password: {
        type: Sequelize.STRING
      },
      RoleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Roles', // Assuming you have a Roles table
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      Classification: {
        type: Sequelize.ENUM('Management', 'Employee')
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
    await queryInterface.dropTable('Users');
  }
};