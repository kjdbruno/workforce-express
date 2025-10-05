'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with Apllication
      Profile.hasMany(models.Application, {
        foreignKey: 'profileId',
        as: 'applications'
      });

      // Profile has one EmploymentInformation
      Profile.hasOne(models.EmploymentInformation, {
        foreignKey: 'profileId',
        as: 'employmentInformation'
      });

      // Association with EmploymentPhoto
      Profile.hasMany(models.EmploymentPhoto, {
        foreignKey: 'profileId',
        as: 'employmentPhotos'
      });

      // Assciation with EmploymentSchedule
      Profile.hasMany(models.EmploymentSchedule, {
        foreignKey: 'profileId',
        as: 'employmentSchedules'
      });

      // Association with Sex
      Profile.belongsTo(models.Sex, {
        foreignKey: 'sexId',
        as: 'sex'
      });
      
      // Association with CivilStatus
      Profile.belongsTo(models.CivilStatus, {
        foreignKey: 'civilStatusId',
        as: 'civilStatus'
      });

      // Association with BloodType
      Profile.belongsTo(models.BloodType, {
        foreignKey: 'bloodTypeId',
        as: 'bloodType'
      });

      // Association with Region
      Profile.belongsTo(models.Region, {
        foreignKey: 'regionId',
        as: 'region'
      });

      // Association with Province
      Profile.belongsTo(models.Province, {
        foreignKey: 'provinceId',
        as: 'province'
      });

      // Association with Town
      Profile.belongsTo(models.Town, {
        foreignKey: 'townId',
        as: 'town'
      });

      // Association with Barangay
      Profile.belongsTo(models.Barangay, {
        foreignKey: 'barangayId',
        as: 'barangay'
      });

      // Association with ProfileContactInformation
      Profile.hasMany(models.ProfileContactInformation, {
        foreignKey: 'profileId',
        as: 'contactInformations'
      });

      // Association with ProfileDependent
      Profile.hasMany(models.ProfileDependent, {
        foreignKey: 'profileId',
        as: 'dependents'
      });
      
      // Association with ProfileDocument
      Profile.hasMany(models.ProfileDocument, {
        foreignKey: 'profileId',
        as: 'documents'
      });

      // Association with ProfileEducation
      Profile.hasMany(models.ProfileEducation, {
        foreignKey: 'profileId',
        as: 'educations'
      });

      // Association with ProfileExperience
      Profile.hasMany(models.ProfileExperience, {
        foreignKey: 'profileId',
        as: 'experiences'
      });

      // Association with ProfileTraining
      Profile.hasMany(models.ProfileTraining, {
        foreignKey: 'profileId',
        as: 'trainings'
      });

      // Association with User
      Profile.hasOne(models.User, {
        foreignKey: 'profileId',
        as: 'user'
      });

      // Association with ProfilePhoto
      Profile.hasOne(models.ProfilePhoto, {
        foreignKey: 'profileId',
        as: 'photos'
      });

    }
  }
  Profile.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middlename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    suffix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sexId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sexes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    civilStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CivilStatuses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    birthplace: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    bloodTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BloodTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    regionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Regions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    provinceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Provinces',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    townId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Towns',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    barangayId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Barangays',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    streetAddress: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    isEmployee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'Profiles',
    timestamps: true
  });
  return Profile;
};