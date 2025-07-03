'use strict';

const barangays = require('./data/barangay.json');

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
    await queryInterface.bulkInsert('Barangays', barangays.map(b => ({
      TownCode: b.citymunCode, // Assuming barangay.json has a town code field
      BarangayCode: b.brgyCode, // Assuming barangay.json has a barangay code field
      Name: b.brgyDesc, // Assuming barangay.json has a barangay
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Barangays', null, {});
  }
};
