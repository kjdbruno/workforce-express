'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming DocumentType has a foreign key DocumentTypeId in ApplicationDocument
      // This allows you to access the ApplicationDocuments associated with a DocumentType instance
      DocumentType.hasMany(models.ApplicationDocument, {
        foreignKey: 'DocumentTypeId',
        as: 'ApplicationDocuments',
      });

      // Assuming DocumentType has many EmploymentDocuments
      // This allows you to access the EmploymentDocuments associated with a DocumentType instance
      DocumentType.hasMany(models.EmploymentDocument, {
        foreignKey: 'DocumentTypeId',
        as: 'EmploymentDocuments',
      });
    }
  }
  DocumentType.init({
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
    modelName: 'DocumentType',
    tableName: 'documenttypes', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return DocumentType;
};