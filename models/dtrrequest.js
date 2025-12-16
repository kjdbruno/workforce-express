'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DtrRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Association with TimeCard
      DtrRequest.belongsTo(models.TimeCard, {
        foreignKey: 'dtrId',
        as: 'timeCard'
      });

      // Association with Signatory
      DtrRequest.belongsTo(models.Signatory, {
        foreignKey: 'signatoryId',
        as: 'signatory'
      });
    }
  }
  DtrRequest.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    dtrId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'TimeCards',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    signatoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Signatories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved'),
      defaultValue: 'Pending'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'DtrRequest',
    tableName: 'DtrRequests',
    timestamps: true
  });
  return DtrRequest;
};