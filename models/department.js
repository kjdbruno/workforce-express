'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming Department has a foreign key DepartmentId in EmploymentInformation
      // This allows you to access the EmploymentInformation associated with a Department instance
      Department.hasOne(models.EmploymentInformation, {
        foreignKey: 'DepartmentId',
        as: 'EmploymentInformation',
      });

      // Assuming Department has many EmploymentHistories
      // This allows you to access the EmploymentHistories associated with a Department instance
      Department.hasMany(models.EmploymentHistory, {
        foreignKey: 'DepartmentId',
        as: 'EmploymentHistories',
      });
      
    }
  }
  Department.init({
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
    modelName: 'Deoartment',
    tableName: 'departments',
    timestamps: true,
  });
  return Department;
};