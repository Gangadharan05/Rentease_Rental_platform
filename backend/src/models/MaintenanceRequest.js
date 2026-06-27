const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MaintenanceRequest extends Model {}

MaintenanceRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rentalId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    issueDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved'),
      defaultValue: 'open',
    },
    resolutionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'MaintenanceRequest',
    tableName: 'maintenance_requests',
  }
);

module.exports = MaintenanceRequest;
