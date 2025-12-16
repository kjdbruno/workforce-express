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

      // Association with LeaveRequest
      Signatory.hasMany(models.LeaveRequest, {
        foreignKey: 'signatoryId',
        as: 'leaveRequests'
      });

      // Association with OvertimeRequest
      Signatory.hasMany(models.OvertimeRequest, {
        foreignKey: 'signatoryId',
        as: 'overtimeRequests'
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
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