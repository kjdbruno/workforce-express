'use strict';

const photos = require('./data/photo.json')

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
      await queryInterface.bulkInsert('ProfilePhotos', photos.map(p => ({
        profileId: p.profileId,
        photo: p.photo,
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
    await queryInterface.bulkDelete('ProfilePhotos', null, {});
  }
};
