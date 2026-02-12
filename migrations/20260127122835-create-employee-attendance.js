'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeAttendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      attendance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Attendances',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      work_day: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      time_in: {
        type: Sequelize.TIME,
        allowNull: false
      },
      time_out: {
        type: Sequelize.TIME,
        allowNull: false
      },
      late_minutes: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      undertime_minutes: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      overtime_minutes: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmployeeAttendances');
  }
};