'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmploymentDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming EmploymentDocument has a foreign key EmploymentId in EmploymentInformation
      // This allows you to access the EmploymentInformation associated with an EmploymentDocument instance
      EmploymentDocument.belongsTo(models.EmploymentInformation, {
        foreignKey: 'EmploymentId',
        as: 'EmploymentInfo',
      });

      // Assuming EmploymentDocument has a foreign key DocumentTypeId in DocumentType
      // This allows you to access the DocumentType associated with an EmploymentDocument instance
      EmploymentDocument.belongsTo(models.DocumentType, {
        foreignKey: 'DocumentTypeId',
        as: 'DocumentType',
      });
    }
  }
  EmploymentDocument.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    EmploymentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'EmploymentInformations', // Assuming you have an Employment model
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    DocumentTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'DocumentTypes', // Assuming you have a DocumentType model
        key: 'Id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    File: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default value for IsActive
    },
  }, {
    sequelize,
    modelName: 'EmploymentDocument',
    tableName: 'employmentdocuments', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return EmploymentDocument;
};