'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SchoolLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming SchoolLevel has many EmployeeEducation
      // This allows you to access the EmployeeEducation associated with a SchoolLevel instance
      SchoolLevel.hasMany(models.EmployeeEducation, {
        foreignKey: 'SchoolLevelId',
        as: 'EmployeeEducation',
      });
      
    }
  }
  SchoolLevel.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure Name is unique
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'SchoolLevel',
    tableName: 'schoollevels', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return SchoolLevel;
};