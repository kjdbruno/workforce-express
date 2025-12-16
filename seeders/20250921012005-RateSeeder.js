'use strict';

const rates = require('./data/rate.json')

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
      for (const item of rates) {
        await queryInterface.bulkInsert(
          'Salaries',
          [
            {
              classId: item.classId,
              gradeId: item.gradeId,
              positionId: item.positionId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          {}
        );
        const rateRecords = item.rates.map(r => ({
          salaryId: r.salaryId,
          stepId: r.stepId,
          monthlyCompensation: parseFloat(r.monthCompensation),
          dailyCompensation: parseFloat(r.dailyCompensation),
          hourlyCompensation: parseFloat(r.hourlyCompensation),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        await queryInterface.bulkInsert('Rates', rateRecords, {});
      }
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
    await queryInterface.bulkDelete('Rates', null, {});
    await queryInterface.bulkDelete('Salaries', null, {});
  }
};
