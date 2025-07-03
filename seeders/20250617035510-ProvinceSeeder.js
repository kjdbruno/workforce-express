'use strict';

const provinces = require('./data/province.json');

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
    await queryInterface.bulkInsert('Provinces', provinces.map(p => ({
      RegionCode: p.regCode, // Assuming province.json has a region code field
      ProvinceCode: p.provCode, // Assuming province.json has a province code field
      Name: p.provDesc, // Assuming province.json has a province description field
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
    await queryInterface.bulkDelete('Provinces', null, {});
  }
};
