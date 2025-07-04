'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EligibilityType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EligibilityType has many EmployeeEligibility
      // This allows you to access the EmployeeEligibility associated with an EligibilityType instance
      EligibilityType.hasMany(models.EmployeeEligibility, {
        foreignKey: 'EligibilityTypeId',
        as: 'EmployeeEligibility',
      });
    }
  }
  EligibilityType.init({
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
      defaultValue: true, // Default value for IsActive
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'EligibilityType',
    tableName: 'eligibilitytypes', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EligibilityType;
};