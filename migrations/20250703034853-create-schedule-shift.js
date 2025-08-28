'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScheduleShifts', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ClassId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ScheduleClasses',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      TimeStart: {
        type: Sequelize.TIME,
        allowNull: false
      },
      TimeEnd: {
        type: Sequelize.TIME,
        allowNull: false
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      CreatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      UpdatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ScheduleShifts');
  }
};