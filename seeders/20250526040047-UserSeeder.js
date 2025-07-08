'use strict';
const bcrypt = require('bcrypt');

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

    // await queryInterface.bulkInsert('Users', [
    //   { name: 'Super Administrator', username: 'SuperAdministrator', password: hashedPassword, isInternal: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    //   { name: 'Administrator', username: 'Administrator', password: hashedPassword, isInternal: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    //   { name: 'Encoder', username: 'Encoder', password: hashedPassword, isInternal: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    // ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // await queryInterface.bulkDelete('Users', null, {});
  }
};
