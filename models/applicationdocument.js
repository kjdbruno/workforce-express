'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ApplicationDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming ApplicationDocument has a foreign key ApplicationId in Application
      // This allows you to access the Application associated with an ApplicationDocument instance
      ApplicationDocument.belongsTo(models.Application, {
        foreignKey: 'ApplicationId',
        as: 'Application',
      });

      // Assuming ApplicationDocument has a foreign key DocumentTypeId in DocumentType
      // This allows you to access the DocumentType associated with an ApplicationDocument instance
      ApplicationDocument.belongsTo(models.DocumentType, {
        foreignKey: 'DocumentTypeId',
        as: 'DocumentType',
      });
    }
  }
  ApplicationDocument.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ApplicationId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for optional association
      references: {
        model: 'Applications', // Assuming the Applications table exists
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    DocumentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for optional association
      references: {
        model: 'DocumentTypes', // Assuming the DocumentTypes table exists
        key: 'Id',
      },
      onDelete: 'SET NULL', // Optional: define behavior on delete
      onUpdate: 'SET NULL', // Optional: define behavior on update
    },
    File: {
      type: DataTypes.STRING,
      allowNull: false, // File is required
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ApplicationDocument',
    tableName: 'applicationdocuments', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return ApplicationDocument;
};