'use strict';

const qualifications = require('./data/qualification.json')

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
      await queryInterface.bulkInsert('PositionQualifications', qualifications.map(q => ({
        positionId: q.positionId,
        name: q.name,
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
    await queryInterface.bulkDelete('PositionQualifications', null, {});
  }
};
