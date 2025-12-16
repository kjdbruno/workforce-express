'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileLeave extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Profile
      ProfileLeave.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });

      // Association with LeaveType
      ProfileLeave.belongsTo(models.LeaveType, {
        foreignKey: 'typeId',
        as: 'leaveType'
      });

      // Association with Leave (Leave Apllication)
      ProfileLeave.hasMany(models.Leave, {
        foreignKey: 'leaveId',
        as: 'leaves'
      });
    }
  }
  ProfileLeave.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LeaveTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    credit: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'ProfileLeave',
    tableName: 'ProfileLeaves',
    timestamps: true
  });
  return ProfileLeave;
};