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
   await queryInterface.bulkInsert('BloodTypes', [
      { name: 'A+', createdAt: new Date(), updatedAt: new Date() },
      { name: 'A-', createdAt: new Date(), updatedAt: new Date() },
      { name: 'B+', createdAt: new Date(), updatedAt: new Date() },
      { name: 'B-', createdAt: new Date(), updatedAt: new Date() },
      { name: 'AB+', createdAt: new Date(), updatedAt: new Date() },
      { name: 'AB-', createdAt: new Date(), updatedAt: new Date() },
      { name: 'O+', createdAt: new Date(), updatedAt: new Date() },
      { name: 'O-', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('BloodTypes', null, {});
  }
};
