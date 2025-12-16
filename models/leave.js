'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Leave extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with ProfileLeave
      Leave.belongsTo(models.ProfileLeave, {
        foreignKey: 'leaveId',
        as: 'profileLeave'
      });

      // Association with LeaveRequests
      Leave.hasMany(models.LeaveRequest, {
        foreignKey: 'leaveId',
        as: 'requests'
      });
      
    }
  }
  Leave.init({
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
        model: 'ProfileLeaves',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    dateStart: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    dateEnd: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Filed', 'Approved', 'Rejected', 'Cancelled'),
      defaultValue: 'Pending'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Leave',
    tableName: 'Leaves',
    timestamps: true
  });
  return Leave;
};