'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      EmployeeLog.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });

    }
  }
  EmployeeLog.init({
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
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    captured_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    recognition_score: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false
    },
    liveness_passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    camera_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source: {
      type: DataTypes.ENUM('Kiosk', 'Mobile', 'Web'),
      allowNull: false
    },
    geo_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
    },
    geo_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
    },
    image_path: {
      type: DataTypes.BLOB('long'),
      allowNull: false
    },
    image_hash: {
      type: DataTypes.CHAR(64),
      allowNull: false
    },
    payload_hash: {
      type: DataTypes.CHAR(64),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'EmployeeLog',
    tableName: 'EmployeeLogs',
    timestamps: true
  });
  return EmployeeLog;
};