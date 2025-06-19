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
      regionCode: p.regCode, // Assuming province.json has a region code field
      provinceCode: p.provCode, // Assuming province.json has a province code field
      name: p.provDesc, // Assuming province.json has a province description field
      createdAt: new Date(),
      updatedAt: new Date()
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
