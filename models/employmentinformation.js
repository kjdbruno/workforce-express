'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmploymentInformation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmploymentInformation.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles', // Assuming Profiles is the table name
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    employeeNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure employeeNo is unique
    },
    BiometricId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Ensure BiometricId is unique
    },
    DateHired: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Tin: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Ensure Tin is unique
    },
    PagIbigNo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Ensure PagIbigNo is unique
    },
    PhilHealthNo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Ensure PhilHealthNo is unique
    },
    SSSNo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Ensure SssNo is unique
    },
    BankAccountNo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Ensure BankAccountNo is unique
    },
    TaxCodeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'TaxCodes', // Assuming TaxCodes is the table name
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    TaxTableId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'TaxTables', // Assuming TaxTables is the table name
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    DepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Departments', // Assuming Departments is the table name
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    PositionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Positions', // Assuming Positions is the table name
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    EmploymentStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'EmploymentStatuses', // Assuming EmploymentStatuses is the table name
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    AppointmentStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'AppointmentStatuses', // Assuming AppointmentStatuses is the table name
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
  }, {
    sequelize,
    modelName: 'EmploymentInformation',
    tableName: 'employmentinformations', // Specify the table name
    timestamps: true, // Enable timestamps
  });
  return EmploymentInformation;
};