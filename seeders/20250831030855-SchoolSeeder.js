'use strict';

const province = require('../models/province');
const schools = require('./data/schoollevel.json')

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
   
    try {
      await queryInterface.bulkInsert('Schools', schools.map(s => ({
        name: s.name,
        type: s.type,
        province: s.province,
        town: s.town,
        website: s.website,
        contactNo: s.contactNo,
        createdAt: new Date(),
        updatedAt: new Date()
      })), {});
    } catch (error) {
      console.error('Seeder error:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Schools', null, {});
  }
};
