'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vacancies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      control_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      position_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Positions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      date_needed: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      location: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      movement: {
        type: Sequelize.ENUM('Addition', 'Replacement'),
        allowNull: false
      },
      justification: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      need_background_check: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      employment_status: {
        type: Sequelize.ENUM('Regular', 'Probationary', 'Contractual', 'Temporary', 'Intern'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Vacant', 'Requested', 'Approved', 'Rejected', 'Filled'),
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
    await queryInterface.dropTable('Vacancies');
  }
};