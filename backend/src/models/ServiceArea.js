const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ServiceArea extends Model {}

ServiceArea.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'ServiceArea',
    tableName: 'service_areas',
  }
);

module.exports = ServiceArea;
