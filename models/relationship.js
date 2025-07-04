'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Relationship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming Relationship has a foreign key EmployeeDependentId in EmployeeDependent
      // This allows you to access the EmployeeDependents associated with a Relationship instance 
      Relationship.hasMany(models.EmployeeDependent, {
        foreignKey: 'RelationshipId',
        as: 'EmployeeDependents',
      });
    }
  }
  Relationship.init({
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
      defaultValue: true, // Default value for IsActive
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Relationship',
    tableName: 'relationships', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Relationship;
};