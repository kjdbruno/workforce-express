'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OvertimeRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with OvertimeRequest
      OvertimeRequest.belongsTo(models.Overtime, {
        foreignKey: 'overtimeId',
        as: 'overtime'
      });

      // Association with Signatory
      OvertimeRequest.belongsTo(models.Signatory, {
        foreignKey: 'signatoryId',
        as: 'signatory'
      });
    }
  }
  OvertimeRequest.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    overtimeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Overtimes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    signatoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Signatories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'OvertimeRequest',
    tableName: 'OvertimeRequests',
    timestamps: true
  });
  return OvertimeRequest;
};