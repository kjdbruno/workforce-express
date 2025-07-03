'use strict';

const regions = require('./data/region.json'); // Adjust the path as necessary

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
   await queryInterface.bulkInsert('Regions', regions.map(r => ({
      RegionCode: r.regCode, // Assuming region.json has a region code field
      Name: r.regDesc,
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
    await queryInterface.bulkDelete('Regions', null, {});
  }
};
