'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmploymentHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EmploymentHistory has a foreign key EmploymentId in EmploymentInformation
      // This allows you to access the EmploymentInformation associated with an EmploymentHistory instance
      EmploymentHistory.belongsTo(models.EmploymentInformation, {
        foreignKey: 'EmploymentId',
        as: 'EmploymentInformation',
      });

      // Assuming EmploymentHistory has a foreign key PositionId in Position
      // This allows you to access the Position associated with an EmploymentHistory instance
      EmploymentHistory.belongsTo(models.Position, {
        foreignKey: 'PositionId',
        as: 'Position',
      });

      // Assuming EmploymentHistory has a foreign key EmploymentStatusId in EmploymentStatus
      // This allows you to access the EmploymentStatus associated with an EmploymentHistory instance
      EmploymentHistory.belongsTo(models.EmploymentStatus, {
        foreignKey: 'EmploymentStatusId',
        as: 'EmploymentStatus',
      });

      // Assuming EmploymentHistory has a foreign key DepartmentId in Department
      // This allows you to access the Department associated with an EmploymentHistory instance
      EmploymentHistory.belongsTo(models.Department, {
        foreignKey: 'DepartmentId',
        as: 'Department',
      });
    }
  }
  EmploymentHistory.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    EmploymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmploymentInformations', // Assuming you have an Employments table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    PositionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions', // Assuming you have a Positions table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    EmploymentStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmploymentStatuses', // Assuming you have an EmploymentStatuses table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    DepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments', // Assuming you have a Departments table
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    StartDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    Remarks: {
      type: DataTypes.TEXT('long'), // Use TEXT for long text fields
    },
  }, {
    sequelize,
    modelName: 'EmploymentHistory',
  });
  return EmploymentHistory;
};