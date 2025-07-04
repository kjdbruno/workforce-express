'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AppointmentStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming AppointmentStatus has a foreign key AppointmentStatusId in EmploymentInformation
      // This allows you to access the EmploymentInformation associated with an AppointmentStatus instance
      AppointmentStatus.hasOne(models.EmploymentInformation, {
        foreignKey: 'AppointmentStatusId',
        as: 'EmploymentInformation',
      });
    }
  }
  AppointmentStatus.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'AppointmentStatus',
    tableName: 'appointmentstatuses', // Specify the table name
    timestamps: true,
  });
  return AppointmentStatus;
};
