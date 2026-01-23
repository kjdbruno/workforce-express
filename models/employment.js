'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Employment → Employee
      Employment.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });

      // Employment → Department
      Employment.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department'
      });

      // Employment → Company
      Employment.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });

      // Employment → Schedule
      Employment.belongsTo(models.Schedule, {
        foreignKey: 'schedule_id',
        as: 'schedule'
      });

      // Employment → Position
      Employment.belongsTo(models.Position, {
        foreignKey: 'position_id',
        as: 'position'
      });
    }
  }
  Employment.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    employee_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    date_hired: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sss_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pagibig_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    philhealth_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employment_status: {
      type: DataTypes.ENUM('Regular', 'Probationary', 'Contractual', 'Temporary', 'Intern'),
      allowNull: false
    },
    tax_status: {
      type: DataTypes.ENUM('S', 'ME', 'S1', 'S2', 'S3', 'S4', 'ME1', 'ME2', 'ME3', 'ME4', 'Z'),
      allowNull: false
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Schedules',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Positions',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    payroll_group: {
      type: DataTypes.ENUM('Monthly', 'Semi-Monthly', 'Weekly'),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Employment',
    tableName: 'Employments',
    timestamps: true
  });
  return Employment;
};