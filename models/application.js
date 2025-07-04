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

      // Assuming Application belongs to Profile
      // and Application has a foreign key ProfileId that references Profile's Id
      Application.belongsTo(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Profile',
      });

      // Assuming Application belongs to Position
      // and Application has a foreign key PositionId that references Position's Id
      Application.belongsTo(models.Position, {
        foreignKey: 'PositionId',
        as: 'Position',
      });

      // Assuming Application has many ApplicationDocuments
      // This allows you to access the ApplicationDocuments associated with an Application instance
      Application.hasMany(models.ApplicationDocument, {
        foreignKey: 'ApplicationId',
        as: 'Documents',
      });
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