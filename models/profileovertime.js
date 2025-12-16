'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileOvertime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Overtime
      ProfileOvertime.belongsTo(models.Overtime, {
        foreignKey: 'overtimeId',
        as: 'overtime'
      });

      //Association with Profile
      ProfileOvertime.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });
    }
  }
  ProfileOvertime.init({
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'ProfileOvertime',
    tableName: 'ProfileOvertimes',
    timestamps: true
  });
  return ProfileOvertime;
};