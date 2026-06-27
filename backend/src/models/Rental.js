const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Rental extends Model {}

Rental.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenureMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    monthlyRent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    securityDeposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPayable: {
      // first month rent + security deposit, charged at checkout
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'delivered',
        'active',
        'return_requested',
        'completed',
        'cancelled'
      ),
      defaultValue: 'pending',
    },
    returnRequested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    damageNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Rental',
    tableName: 'rentals',
  }
);

module.exports = Rental;
