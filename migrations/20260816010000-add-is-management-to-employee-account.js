'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('EmployeeAccounts', 'is_management', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('EmployeeAccounts', 'is_management');
  }
};
