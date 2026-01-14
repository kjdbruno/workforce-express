'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Applicant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Applicant → Vacancy
      Applicant.belongsTo(models.Vacancy, {
        foreignKey: 'vacancy_id',
        as: 'vacancy'
      });
      // Applicant → Documents
      Applicant.hasMany(models.ApplicantDocument, {
        foreignKey: 'applicant_id',
        as: 'documents'
      });
      // Applicant → Education
      Applicant.hasMany(models.ApplicantEducation, {
        foreignKey: 'applicant_id',
        as: 'educations'
      });
      // Applicant → Work Experience
      Applicant.hasMany(models.ApplicantExperience, {
        foreignKey: 'applicant_id',
        as: 'experiences'
      });
      // Applicant → Trainings
      Applicant.hasMany(models.ApplicantTraining, {
        foreignKey: 'applicant_id',
        as: 'trainings'
      });
    }
  }
  Applicant.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    vacancy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vacancies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middle_name: {
      type: DataTypes.STRING
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    suffix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sex: {
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: false
    },
    civil_status: {
      type: DataTypes.ENUM('Single', 'Married', 'Widowed', 'Divorced', 'Separated'),
      allowNull: false
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    birthplace: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    blood_type: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pooling', 'Shortlisted', 'Interview', 'Hired', 'Rejected', 'Withdrawn'),
      defaultValue: 'Pooling'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Applicant',
    tableName: 'Applicants',
    timestamps: true
  });
  return Applicant;
};