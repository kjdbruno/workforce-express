'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Application.init({
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
        key: 'Id',
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
    },
    PositionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Positions', // Assuming you have a Positions table
        key: 'Id',
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
    },
    Status: {
      type: DataTypes.ENUM('Pooling', 'Hired', 'Rejected', 'Withdrawn'),
      defaultValue: 'Pooling', // Default status for new applications
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
    },
  }, {
    sequelize,
    modelName: 'Application',
    tableName: 'applications', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Application;
};