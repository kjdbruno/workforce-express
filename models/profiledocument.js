'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assocition with Profile
      ProfileDocument.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });

    }
  }
  ProfileDocument.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:  {
        model: 'Profiles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'ProfileDocument',
    tableName: 'ProfileDocuments',
    timestamps: true
  });
  return ProfileDocument;
};