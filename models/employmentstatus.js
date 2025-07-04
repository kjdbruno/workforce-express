'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmploymentStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EmploymentStatus has a foreign key EmploymentStatusId in EmploymentInformation
      // This allows you to access the EmploymentInformation associated with an EmploymentStatus instance
      EmploymentStatus.hasOne(models.EmploymentInformation, {
        foreignKey: 'EmploymentStatusId',
        as: 'EmploymentInformation',
      });

      // Assuming EmploymentStatus has many EmploymentHistories
      // This allows you to access the EmploymentHistories associated with an EmploymentStatus instance
      EmploymentStatus.hasMany(models.EmploymentHistory, {
        foreignKey: 'EmploymentStatusId', 
        as: 'EmploymentHistories',
      });
      
    }
  }
  EmploymentStatus.init({
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
    modelName: 'EmploymentStatus',
    tableName: 'employmentstatuses',
    timestamps: true,
  });
  return EmploymentStatus;
};