'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Profile.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    SexId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sexes', // Assuming Sexes is the table name
        key: 'Id',
      },
    },
    CivilStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'CivilStatuses', // Assuming CivilStatuses is the table name
        key: 'Id',
      },
    },
    BirthPlace: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    BloodTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'BloodTypes', // Assuming BloodTypes is the table name
        key: 'Id',
      },
    },
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Profile;
};