'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProfileTraining extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Training
      ProfileTraining.belongsTo(models.Profile, {
        foreignKey: 'profileId',
        as: 'profile'
      });
    }
  }
  ProfileTraining.init({
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
    title: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hour: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'Technical',        // job-related skills
        'Managerial',       // supervisory / leadership
        'Supervisory',      // for mid-level managers
        'Mandatory',        // required by CSC/agency
        'Orientation',      // onboarding / induction
        'Seminar',          // short learning sessions
        'Workshop',         // hands-on practical training
        'Conference'        // external or large event
      ),
      allowNull: false
    },
    conductedBy: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    file: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'ProfileTraining',
    tableName: 'ProfileTrainings',
    timestamps: true
  });
  return ProfileTraining;
};