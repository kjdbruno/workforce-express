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

      // Assuming Profile has a foreign key ProfileId in Application
      // This allows you to access the Applications associated with a Profile instance
      Profile.hasMany(models.Application, {
        foreignKey: 'ProfileId',
        as: 'Applications',
      });

      // Assuming Profile belongs to Sex
      // and Profile has a foreign key SexId that references
      Profile.belongsTo(models.Sex, {
        foreignKey: 'SexId',
        as: 'Sex',
      });

      // Assuming Profile belongs to CivilStatus
      // and Profile has a foreign key CivilStatusId that references CivilStatus's Id
      Profile.belongsTo(models.CivilStatus, {
        foreignKey: 'CivilStatusId',
        as: 'CivilStatus',
      });

      // Assuming Profile has a foreign key BloodTypeId in BloodType
      // This allows you to access the BloodType associated with a Profile instance
      Profile.belongsTo(models.BloodType, {
        foreignKey: 'BloodTypeId',
        as: 'BloodType',
      });

      // Assuming Profile has one EmploymentInformation
      // This allows you to access the EmploymentInformation associated with a Profile instance
      Profile.hasOne(models.EmploymentInformation, {
        foreignKey: 'ProfileId',
        as: 'EmploymentInformation',
      });

      // Assuming Profile has many EmployeeContactDetails
      // This allows you to access the EmployeeContactDetails associated with a Profile instance
      Profile.hasOne(models.EmployeeContactDetail, {
        foreignKey: 'ProfileId',
        as: 'EmployeeContactDetails',
      });

      // Assuming Profile has many EmployeeDependents
      // This allows you to access the EmployeeDependents associated with a Profile instance
      Profile.hasMany(models.EmployeeDependent, {
        foreignKey: 'ProfileId',
        as: 'EmployeeDependents',
      });

      // Assuming Profile has many EmployeeEducations
      // This allows you to access the EmployeeEducations associated with a Profile instance
      Profile.hasMany(models.EmployeeEducation, {
        foreignKey: 'ProfileId',
        as: 'EmployeeEducations',
      });

      // Assuming Profile has many EmployeeEligibilities
      // This allows you to access the EmployeeEligibilities associated with a Profile instance
      Profile.hasMany(models.EmployeeEligibility, {
        foreignKey: 'ProfileId',
        as: 'Eligibilities',
      });

      // Assuming Profile has many EmployeeLeaveApplications
      // This allows you to access the EmployeeLeaveApplications associated with a Profile instance
      Profile.hasMany(models.EmployeeLeaveApplication, {
        foreignKey: 'ProfileId',
        as: 'LeaveApplications',
      });

      // Assuming Profile has many EmployeeLeaveCredits
      // This allows you to access the EmployeeLeaveCredits associated with a Profile instance
      Profile.hasMany(models.EmployeeLeaveCredit, {
        foreignKey: 'ProfileId',
        as: 'LeaveCredits',
      });

      // Assuming Profile has many Evaluations
      // This allows you to access the Evaluations associated with a Profile instance
      Profile.hasMany(models.Profile, {
        foreignKey: 'ProfileId',
        as: 'Evaluations',
      });

      // Assuming Profile has many Evaluator
      // This allows you to access the Evaluators associated with a Profile instance
      Profile.hasMany(models.Profile, {
        foreignKey: 'ReviewerId',
        as: 'Evaluators',
      });

      // Assuming Profile has many EmployeeTrainings 
      // This allows you to access the EmployeeTrainings associated with a Profile instance
      Profile.hasMany(models.EmployeeTraining, {
        foreignKey: 'ProfileId',
        as: 'EmployeeTrainings',
      });
    }
  }
  Profile.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MiddleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Suffix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    BirthDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    SexId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sexes', // Assuming Sexes is the table name
        key: 'Id',
      },
    },
    CivilStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'CivilStatuses', // Assuming CivilStatuses is the table name
        key: 'Id',
      },
    },
    BirthPlace: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    BloodTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'BloodTypes', // Assuming BloodTypes is the table name
        key: 'Id',
      },
    },
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Profile;
};