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
      { Name: 'A+', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'A-', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'B+', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'B-', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'AB+', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'AB-', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'O+', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'O-', CreatedAt: new Date(), UpdatedAt: new Date() },
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
