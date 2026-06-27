const { Op, fn, col } = require('sequelize');
const { Rental, Product, User, MaintenanceRequest } = require('../models');

const ACTIVE_STATUSES = ['confirmed', 'delivered', 'active'];

// @route   GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const activeRentals = await Rental.findAll({ where: { status: { [Op.in]: ACTIVE_STATUSES } } });
    const activeRentalsCount = activeRentals.length;
    const mrr = activeRentals.reduce((sum, r) => sum + parseFloat(r.monthlyRent), 0);

    const products = await Product.findAll();
    const totalUnits = products.reduce((sum, p) => sum + p.totalUnits, 0);
    const availableUnits = products.reduce((sum, p) => sum + p.availableUnits, 0);
    const rentedUnits = totalUnits - availableUnits;
    const utilizationRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 1000) / 10 : 0;

    const allRentalUserIds = await Rental.findAll({ attributes: ['userId'] });
    const rentalCountByUser = {};
    allRentalUserIds.forEach((r) => {
      rentalCountByUser[r.userId] = (rentalCountByUser[r.userId] || 0) + 1;
    });
    const totalCustomersWithRentals = Object.keys(rentalCountByUser).length;
    const repeatCustomers = Object.values(rentalCountByUser).filter((c) => c > 1).length;
    const retentionRate =
      totalCustomersWithRentals > 0
        ? Math.round((repeatCustomers / totalCustomersWithRentals) * 1000) / 10
        : 0;

    const resolvedRequests = await MaintenanceRequest.findAll({ where: { status: 'resolved' } });
    let avgResolutionHours = 0;
    if (resolvedRequests.length > 0) {
      const totalHours = resolvedRequests.reduce((sum, req) => {
        const created = new Date(req.createdAt);
        const resolved = new Date(req.resolvedAt || req.updatedAt);
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedRequests.length) * 10) / 10;
    }

    const openMaintenanceCount = await MaintenanceRequest.count({ where: { status: { [Op.ne]: 'resolved' } } });
    const totalUsers = await User.count({ where: { role: 'customer' } });
    const totalProducts = products.length;

    res.json({
      activeRentalsCount,
      monthlyRecurringRevenue: Math.round(mrr * 100) / 100,
      productUtilizationRate: utilizationRate,
      customerRetentionRate: retentionRate,
      avgMaintenanceResolutionHours: avgResolutionHours,
      openMaintenanceCount,
      totalUsers,
      totalProducts,
      totalUnits,
      availableUnits,
      rentedUnits,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getReports, getUsers };
