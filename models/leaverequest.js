'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeaveRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Leave
      LeaveRequest.belongsTo(models.Leave, {
        foreignKey: 'leaveId',
        as: 'leave'
      });

      // Association with SignatoryProfile
      LeaveRequest.belongsTo(models.Signatory, {
        foreignKey: 'signatoryId',
        as: 'signatory'
      });
    }
  }
  LeaveRequest.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    leaveId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Leaves',
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
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
      defaultValue: 'Pending'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'LeaveRequest',
    tableName: 'LeaveRequests',
    timestamps: true
  });
  return LeaveRequest;
};