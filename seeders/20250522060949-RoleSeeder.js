'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Roles', [
      { Name: 'Super Administrator', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Administrator', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Human Resource: Training', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Human Resource: Performance', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Human Resource: Administration', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Human Resource: Leave Management', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Human Resource: Recruitment and Selection', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Finance: Payroll', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Employee', CreatedAt: new Date(), UpdatedAt: new Date() },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
