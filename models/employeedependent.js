'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeDependent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EmployeeDependent has a foreign key ProfileId in Profile
      // This allows you to access the Profile associated with an EmployeeDependent instance
      EmployeeDependent.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Profile',
      });

      // Assuming EmployeeDependent has a foreign key RelationshipId in Relationship
      // This allows you to access the Relationship associated with an EmployeeDependent instance
      EmployeeDependent.belongsTo(models.Relationship, {
        foreignKey: 'RelationshipId',
        as: 'Relationship',
      });
    }
  }
  EmployeeDependent.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ProfileId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Profiles', // Assuming you have a Profiles table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    RelationshipId : {
      type: DataTypes.INTEGER,
      references: {
        model: 'Relationships', // Assuming you have a Relationships table
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MiddleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Suffix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    BirthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'EmployeeDependent',
    tableName: 'employeedependents', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EmployeeDependent;
};