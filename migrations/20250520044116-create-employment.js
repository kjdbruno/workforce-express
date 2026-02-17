'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employments', {
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      employee_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      date_hired: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sss_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pagibig_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      philhealth_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      employment_status: {
        type: Sequelize.ENUM('Regular', 'Probationary', 'Contractual', 'Temporary', 'Intern'),
        allowNull: false
      },
      tax_status: {
        type: Sequelize.ENUM('S', 'ME', 'S1', 'S2', 'S3', 'S4', 'ME1', 'ME2', 'ME3', 'ME4', 'Z'),
        allowNull: false
      },
      position_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Positions',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      payroll_group: {
        type: Sequelize.ENUM('Monthly', 'Semi-Monthly', 'Weekly'),
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
    await queryInterface.dropTable('Employments');
  }
};