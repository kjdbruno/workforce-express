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

      // Belongs to Profile
      EmploymentHistory.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });
      
      // Belongs to Salary
      EmploymentHistory.belongsTo(models.Salary, {
        foreignKey: 'salaryId',
        as: 'salary'
      });

      // Belongs to EmploymentStatus
      EmploymentHistory.belongsTo(models.EmploymentStatus, {
        foreignKey: 'employmentId',
        as: 'employmentStatus'
      });

      // Belongs to AppointmentStatus
      EmploymentHistory.belongsTo(models.AppointmentStatus, {
        foreignKey: 'appointmentId',
        as: 'appointmentStatus'
      });

      // Association with Rates
      EmploymentHistory.belongsTo(models.Rate, {
        foreignKey: 'rateId',
        as: 'rate'
      });
      
    }
  }
  EmploymentHistory.init({
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
    salaryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Salaries',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    rateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Rates',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    dateStart: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    dateEnd: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'EmploymentHistory',
    tableName: 'EmploymentHistories',
    timestamps: true
  });
  return EmploymentHistory;
};