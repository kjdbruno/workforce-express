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
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      work_day: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      shift_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Shifts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      time_in: {
        type: Sequelize.DATE,
        allowNull: false
      },
      time_out: {
        type: Sequelize.DATE,
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
      status: {
        type: Sequelize.ENUM('Pending', 'Approved'),
        defaultValue: 'Pending'
      },
      is_locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      locked_at: {
        type: Sequelize.DATE,
        allowNull: true
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmployeeAttendances');
  }
};