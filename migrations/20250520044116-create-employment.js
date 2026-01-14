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
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Departments',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Schedules',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
      payroll_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PayrollGroups',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    await queryInterface.dropTable('Employments');
  }
};