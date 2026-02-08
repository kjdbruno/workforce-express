'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ApprovalOveride extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // ApprovalOveride → Approval
      ApprovalOveride.belongsTo(models.Approval, {
        foreignKey: 'approval_id',
        as: 'approval'
      });

      // ApprovalOveride → User (who overrode)
      ApprovalOveride.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  ApprovalOveride.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    approval_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Approvals',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
  }, {
    sequelize,
    modelName: 'ApprovalOveride',
    tableName: 'ApprovalOverides',
    timestamps: true
  });
  return ApprovalOveride;
};