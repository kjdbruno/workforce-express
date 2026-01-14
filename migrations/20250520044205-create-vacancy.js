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
      salary_range: {
        type: Sequelize.STRING,
        allowNull: false
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Schedules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_needed: {
        type: Sequelize.DATE,
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
      sex: {
        type: Sequelize.ENUM('Male', 'Female'),
        allowNull: false
      },
      age_range: {
        type: Sequelize.STRING,
        allowNull: true
      },
      school_level: {
        type: Sequelize.ENUM('High School', 'Vocational', 'College', 'Graduate Studies'),
        allowNull: false
      },
      year_experience: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vacancies');
  }
};