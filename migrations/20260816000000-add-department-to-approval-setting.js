'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ApprovalSettings', 'department_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Sequelize's changeColumn() only emits an ADD FOREIGN KEY statement here
    // (no MODIFY COLUMN) when the type/references are unchanged, so the
    // nullability change is applied with a raw MODIFY COLUMN instead.
    await queryInterface.sequelize.query(
      'ALTER TABLE `ApprovalSettings` MODIFY COLUMN `owner_id` INT NULL'
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `ApprovalSettings` MODIFY COLUMN `owner_id` INT NOT NULL'
    );

    await queryInterface.removeColumn('ApprovalSettings', 'department_id');
  }
};
