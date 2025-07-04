'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 
      Rate.belongsTo(models.SalaryGrade, {
        foreignKey: 'SalaryGradeId',
        as: 'SalaryGrade',
      });

      //
      Rate.belongsTo(models.SalaryClass, {
        foreignKey: 'SalaryClassId',
        as: 'SalaryClass',
      });
    }
  }
  Rate.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    SalaryClassId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SalaryClasses', // Assuming SalaryClasses is the table name
        key: 'Id',
      },
    },
    IncreaseInDay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Rate',
    tableName: 'rates', // Specify the table name
    timestamps: true, // Enable timestamps if needed
  });
  return Rate;
};