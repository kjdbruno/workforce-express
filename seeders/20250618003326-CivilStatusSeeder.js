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
      { name: 'Single', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Married', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Separated', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Widowed', createdAt: new Date(), updatedAt: new Date() },
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
