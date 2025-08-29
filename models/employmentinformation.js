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

      // Belongs to Profile
      EmploymentInformation.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });

      // Belongs to TaxCode
      EmploymentInformation.belongsTo(models.TaxCode, {
        foreignKey: 'taxCodeId',
        as: 'taxCode'
      });

      // Belongs to Department
      EmploymentInformation.belongsTo(models.Department, {
        foreignKey: 'departmentId',
        as: 'department'
      });

      // Belongs to Position
      EmploymentInformation.belongsTo(models.Position, {
        foreignKey: 'positionId',
        as: 'position'
      });

      // Belongs to EmploymentStatus
      EmploymentInformation.belongsTo(models.EmploymentStatus, {
        foreignKey: 'employmentId',
        as: 'employmentStatus'
      });

      // Belongs to AppointmentStatus
      EmploymentInformation.belongsTo(models.AppointmentStatus, {
        foreignKey: 'appointmentId',
        as: 'appointmentStatus'
      });
      
    }
  }
  EmploymentInformation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    employeeNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    biometricNo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    dateHired: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sssNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    philhealthNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pagibigNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taxCodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'TaxCodes',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onDelete: 'CASACDE',
      onUpdate: 'CASACDE'
    },
    employmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmploymentStatuses',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AppointmentStatuses',
        key: 'id'
      },
      onDelete: 'CASDCADE',
      onUpdate: 'CASDCADE'
    },
  }, {
    sequelize,
    modelName: 'EmploymentInformation',
    tableName: 'EmploymentInformations',
    timestamps: true
  });
  return EmploymentInformation;
};