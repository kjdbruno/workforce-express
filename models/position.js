'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Assuming Position belongs to Application
      // and Position has a foreign key PositionId that references Position's Id
      Position.hasMany(models.Application, {
        foreignKey: 'PositionId',
        as: 'Applications',
      });

      // Assuming Position belongs to SalaryGrade
      // and Position has a foreign key SalaryGradeId that references SalaryGrade's Id
      Position.belongsTo(models.SalaryGrade, {
        foreignKey: 'SalaryGradeId',
        as: 'SalaryGrade',
      });

      // Assuming Position has many EmploymentInformation
      // This allows you to access the EmploymentInformation associated with a Position instance
      Position.hasOne(models.EmploymentInformation, {
        foreignKey: 'PositionId',
        as: 'EmploymentInformation',
      });

      // Assuming Position has many EmploymentHistories
      // This allows you to access the EmploymentHistories associated with a Position instance
      Position.hasMany(models.EmploymentHistory, {
        foreignKey: 'PositionId',
        as: 'EmploymentHistories',
      });
      
    }
  }
  Position.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SalaryGradeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SalaryGrades', // Assuming SalaryGrades is the table name
        key: 'Id',
      },
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Position',
    tableName: 'positions', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Position;
};