const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Product extends Model {
  /**
   * Calculate the effective monthly rent for a given tenure.
   * Longer tenures unlock a discount, rewarding commitment - mirrors
   * the "flexible tenure plans" requirement from the PRD.
   */
  getMonthlyRentForTenure(tenureMonths) {
    const base = parseFloat(this.baseMonthlyRent);
    let discount = 0;
    if (tenureMonths >= 12) discount = 0.15;
    else if (tenureMonths >= 6) discount = 0.08;
    else if (tenureMonths >= 3) discount = 0.03;
    const rent = base - base * discount;
    return Math.round(rent * 100) / 100;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('furniture', 'appliance'),
      allowNull: false,
    },
    subCategory: {
      type: DataTypes.STRING, // bed, sofa, table, fridge, washing_machine, tv, other
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'https://placehold.co/600x400?text=Product',
    },
    baseMonthlyRent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    securityDeposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tenureOptions: {
      // months a customer may rent for, e.g. [3, 6, 12]
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      defaultValue: [3, 6, 12],
    },
    totalUnits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    availableUnits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
  }
);

module.exports = Product;
