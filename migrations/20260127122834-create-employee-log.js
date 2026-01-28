'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeLogs', {
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
      captured_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      recognition_score: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false
      },
      liveness_passed: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      camera_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      device_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      source: {
        type: Sequelize.ENUM('Kiosk', 'Mobile', 'Web'),
        allowNull: false
      },
      geo_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      geo_lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      image_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payload_hash: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('EmployeeLogs');
  }
};