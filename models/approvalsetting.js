'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ApprovalSetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      ApprovalSetting.belongsTo(models.User, {
        foreignKey: 'approver_id',
        as: 'approver'
      });

      ApprovalSetting.hasMany(models.Approval, {
        foreignKey: 'setting_id',
        as: 'approvals'
      });

      // Association with User -> ownerId
      ApprovalSetting.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });

      // Association with Department -> departmentId
      ApprovalSetting.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department'
      });
    }
  }
  ApprovalSetting.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    type: {
      type: DataTypes.ENUM('Vacancy', 'Leave', 'TimeCard', 'Overtime'),
      allowNull: false
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    approver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'ApprovalSetting',
    tableName: 'ApprovalSettings',
    timestamps: true
  });
  return ApprovalSetting;
};