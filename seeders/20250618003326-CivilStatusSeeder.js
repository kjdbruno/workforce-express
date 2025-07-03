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
   await queryInterface.bulkInsert('CivilStatuses', [
      { Name: 'Single', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Married', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Separated', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Widowed', CreatedAt: new Date(), UpdatedAt: new Date() },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('CivilStatuses', null, {});
  }
};
