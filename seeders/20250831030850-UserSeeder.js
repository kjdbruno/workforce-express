'use strict';

const bcrypt = require('bcrypt');
const users = require('./data/user.json');
const { stat } = require('fs-extra');

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
    const hashedPassword = await bcrypt.hash('Workforce@2025', 10);

    try {
      await queryInterface.bulkInsert('Users', [
        {
          name: 'Admin User',
          username: 'SuperAdmin',
          password: hashedPassword,
          role: 'SuperAdmin',
          status: 'Active',
          avatar: '/avatar/default.png',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
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
    await queryInterface.bulkDelete('Users', null, {});
  }
};
