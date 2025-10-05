'use strict';

const profiles = require('./data/profile.json')

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
      await queryInterface.bulkInsert('Profiles', profiles.map(p => ({
        firstname: p.firstname,
        middlename: p.middlename,
        lastname: p.lastname,
        suffix: p.suffix,
        sexId: p.sexId,
        civilStatusId: p.civilStatusId,
        birthdate: p.birthdate,
        birthplace: p.birthplace,
        weight: p.weight,
        height: p.height,
        bloodTypeId: p.bloodTypeId,
        regionId: p.regionId,
        provinceId: p.provinceId,
        townId: p.townId,
        barangayId: p.barangayId,
        streetAddress: p.streetAddress,
        isEmployee: p.isEmployee,
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
    await queryInterface.bulkDelete('Profiles', null, {});
  }
};
