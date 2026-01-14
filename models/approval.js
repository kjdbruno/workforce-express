'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Approval extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with ApprovalSetting -> settingId
      Approval.belongsTo(models.ApprovalSetting, {
        foreignKey: 'setting_id',
        as: 'setting'
      });

      // Association with User -> ownerId
      Approval.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });
    }
  }
  Approval.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    setting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ApprovalSettings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending'
    },
    remarks: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    signed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Approval',
    tableName: 'Approvals',
    timestamps: true
  });
  return Approval;
};