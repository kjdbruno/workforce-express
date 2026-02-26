'use strict';

const bcrypt = require('bcryptjs');
const users = require('./data/user.json');
const { stat } = require('fs-extra');
const fs = require('fs');
const path = require('path');

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

    const avatarPath = path.join(__dirname, '../public/default.png');
    const avatarBuffer = fs.readFileSync(avatarPath);

    try {
      await queryInterface.bulkInsert('Users', users.map(s => ({
        name: s.name,
        username: s.username,
        password: bcrypt.hashSync(s.password, 10),
        role: s.role,
        status: s.status,
        avatar: avatarBuffer,
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
    await queryInterface.bulkDelete('Users', null, {});
  }
};
