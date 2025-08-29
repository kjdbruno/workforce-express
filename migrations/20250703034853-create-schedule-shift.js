'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScheduleShifts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ScheduleClasses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      timeStart: {
        type: Sequelize.TIME,
        allowNull: false
      },
      timeEnd: {
        type: Sequelize.TIME,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('ScheduleShifts', ['timeStart']);
    await queryInterface.addIndex('ScheduleShifts', ['timeEnd']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ScheduleShifts', ['timeStart']);
    await queryInterface.removeIndex('ScheduleShifts', ['timeEnd']);
    await queryInterface.dropTable('ScheduleShifts');
  }
};