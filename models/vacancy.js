'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vacancy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Vacancy -> Position
      Vacancy.belongsTo(models.Position, {
        foreignKey: 'position_id',
        as: 'position'
      });

      // Vacancy -> Department
      Vacancy.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department'
      });

      // Vacancy -> Applicant
      Vacancy.hasMany(models.Applicant, {
        foreignKey: 'vacancy_id',
        as: 'applications'
      });

      // Vacancy -> Shift
      Vacancy.belongsTo(models.Shift, {
        foreignKey: 'shift_id',
        as: 'shift'
      });
    }
  }
  Vacancy.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    control_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    shift_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Shifts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    date_needed: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    movement: {
      type: DataTypes.ENUM('Addition', 'Replacement'),
      allowNull: false
    },
    justification: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    need_background_check: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    employment_status: {
      type: DataTypes.ENUM('Regular', 'Probationary', 'Contractual', 'Temporary', 'Intern'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Vacant', 'Requested', 'Approved', 'Rejected', 'Filled'),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Vacancy',
    tableName: 'Vacancies',
    timestamps: true
  });
  return Vacancy;
};