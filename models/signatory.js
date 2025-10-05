'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Signatory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with User
      Signatory.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Association with SignatoryType
      Signatory.belongsTo(models.SignatoryType, {
        foreignKey: 'typeId',
        as: 'type'
      });

      // Association with VacancyRequest
      Signatory.hasMany(models.VacancyRequest, {
        foreignKey: 'signatoryId',
        as: 'requests'
      });
    }
  }
  Signatory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SignatoryTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5"),
      defaultValue: 1
    }, 
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Signatory',
    tableName: 'Signatories',
    timestamps: true
  });
  return Signatory;
};