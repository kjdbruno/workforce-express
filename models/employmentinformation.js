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

      // Assuming EmploymentInformation has a foreign key ProfileId in Profile
      // This allows you to access the Profile associated with an EmploymentInformation instance
      EmploymentInformation.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Profile',
      });

      // Assuming EmploymentInformation has a foreign key TaxCodeId in TaxCode
      // This allows you to access the TaxCode associated with an EmploymentInformation instance
      EmploymentInformation.belongsTo(models.TaxCode, {
        foreignKey: 'TaxCodeId',
        as: 'TaxCode',
      });

      // Assuming EmploymentInformation has a foreign key TaxTableId in TaxTable
      // This allows you to access the TaxTable associated with an EmploymentInformation instance
      EmploymentInformation.belongsTo(models.TaxTable, {
        foreignKey: 'TaxTableId',
        as: 'TaxTable',
      });

      // Assuming EmploymentInformation has a foreign key DepartmentId in Department
      // This allows you to access the Department associated with an EmploymentInformation instance
      EmploymentInformation.belongsTo(models.Department, {
        foreignKey: 'DepartmentId',
        as: 'Department',
      });

      // Assuming EmploymentInformation has a foreign key PositionId in Position
      // This allows you to access the Position associated with an EmploymentInformation instance
      EmploymentInformation.belongsTo(models.Position, {
        foreignKey: 'PositionId',
        as: 'Position',
      });

      // Assuming EmploymentInformation has a foreign key EmploymentStatusId in EmploymentStatus
      // This allows you to access the EmploymentStatus associated with an EmploymentInformation instance
      EmploymentInformation.belongsTo(models.EmploymentStatus, {
        foreignKey: 'EmploymentStatusId',
        as: 'EmploymentStatus',
      });

      // Assuming EmploymentInformation has a foreign key AppointmentStatusId in AppointmentStatus
      // This allows you to access the AppointmentStatus associated with an EmploymentInformation instance
      EmploymentInformation.belongsTo(models.AppointmentStatus, {
        foreignKey: 'AppointmentStatusId',
        as: 'AppointmentStatus',
      });

      // Assuming EmploymentInformation has many EmploymentHistories
      // This allows you to access the EmploymentHistories associated with an EmploymentInformation instance
      EmploymentInformation.hasMany(models.EmploymentHistory, {
        foreignKey: 'EmploymentId',
        as: 'EmploymentHistories',
      });

      // Assuming EmploymentInformation has many EmployeeDocuments
      // This allows you to access the EmployeeDocuments associated with an EmploymentInformation instance
      EmploymentInformation.hasMany(models.EmploymentDocument, {
        foreignKey: 'EmploymentId',
        as: 'EmployeeDocuments',
      });
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
    BiometricNo: {
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