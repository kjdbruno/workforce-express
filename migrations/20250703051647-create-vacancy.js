'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vacancies', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PositionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Positions',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      CompanyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      DepartmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Departments',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ScheduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ScheduleClasses',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      DateNeeded: {
        type: Sequelize.DATE,
        allowNull: false
      },
      Location: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      Movement: {
        type: Sequelize.ENUM('Addition', 'Replacement'),
        allowNull: false
      },
      Justification: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      NeedBackgroundCheck: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      SexId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sexes',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      AgeRange: {
        type: Sequelize.STRING
      },
      EducationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      YearExperience: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      AppointmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'AppointmentStatuses',
          key: 'Id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Status: {
        type: Sequelize.ENUM('Vacant', 'Requested', 'Approved', 'Rejected', 'Filled'),
        allowNull: false
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
    await queryInterface.dropTable('Vacancies');
  }
};