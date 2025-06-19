'use strict';

const towns = require('./data/town.json');

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
   await queryInterface.bulkInsert('Towns', towns.map(t => ({
      provinceCode: t.provCode, // Assuming muncity.json has a province code field
      townCode: t.citymunCode, // Assuming muncity.json has a town code field
      name: t.citymunDesc, // Assuming muncity.json has a town description field
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
    await queryInterface.bulkDelete('Towns', null, {});
  }
};
