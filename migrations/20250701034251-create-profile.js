'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      middlename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      suffix: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sexId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sexes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      civilStatusId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CivilStatuses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      birthplace: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      bloodTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BloodTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      regionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Regions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provinceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Provinces',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      townId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Towns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      barangayId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Barangays',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      streetAddress: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      isEmployee: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.addIndex('Profiles', ['firstname']);
    await queryInterface.addIndex('Profiles', ['middlename']);
    await queryInterface.addIndex('Profiles', ['lastname']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Profiles', ['firstname']);
    await queryInterface.removeIndex('Profiles', ['middlename']);
    await queryInterface.removeIndex('Profiles', ['lastname']);
    await queryInterface.dropTable('Profiles');
  }
};