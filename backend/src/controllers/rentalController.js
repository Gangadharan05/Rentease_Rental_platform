const { sequelize } = require('../config/db');
const { Rental, Product, User } = require('../models');
const ServiceArea = require('../models/ServiceArea');

const TERMINAL_STATUSES = ['completed', 'cancelled'];

// @route   POST /api/rentals  (checkout - converts cart items into rentals)
// body: { items: [{ productId, tenureMonths }], deliveryDate, deliveryAddress, deliveryCity }
const createRentals = async (req, res, next) => {
  const { items, deliveryDate, deliveryAddress, deliveryCity } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }
  if (!deliveryDate || !deliveryAddress || !deliveryCity) {
    return res.status(400).json({ message: 'Delivery date, address and city are required' });
  }

  const serviceArea = await ServiceArea.findOne({ where: { city: deliveryCity, isActive: true } });
  if (!serviceArea) {
    return res.status(400).json({ message: `Delivery is not yet available in ${deliveryCity}` });
  }

  const transaction = await sequelize.transaction();
  try {
    const createdRentals = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction, lock: true });
      if (!product) {
        throw Object.assign(new Error(`Product ${item.productId} not found`), { statusCode: 404 });
      }
      if (product.availableUnits < 1) {
        throw Object.assign(new Error(`${product.name} is currently out of stock`), { statusCode: 400 });
      }
      if (!product.tenureOptions.includes(item.tenureMonths)) {
        throw Object.assign(
          new Error(`${item.tenureMonths} month tenure is not offered for ${product.name}`),
          { statusCode: 400 }
        );
      }

      const monthlyRent = product.getMonthlyRentForTenure(item.tenureMonths);
      const securityDeposit = parseFloat(product.securityDeposit);
      const totalPayable = Math.round((monthlyRent + securityDeposit) * 100) / 100;

      const start = new Date(deliveryDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + item.tenureMonths);

      const rental = await Rental.create(
        {
          userId: req.user.id,
          productId: product.id,
          tenureMonths: item.tenureMonths,
          monthlyRent,
          securityDeposit,
          totalPayable,
          deliveryDate,
          deliveryAddress,
          deliveryCity,
          startDate: deliveryDate,
          endDate: end.toISOString().slice(0, 10),
          status: 'pending',
        },
        { transaction }
      );

      product.availableUnits -= 1;
      await product.save({ transaction });

      createdRentals.push(rental);
    }

    await transaction.commit();
    res.status(201).json(createdRentals);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// @route   GET /api/rentals/my  (current customer's rentals)
const getMyRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(rentals);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rentals  (admin - all rentals, optional ?status=)
const getAllRentals = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const rentals = await Rental.findAll({
      where,
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(rentals);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/rentals/:id/status  (admin)
// body: { status, damageNotes? }
const updateRentalStatus = async (req, res, next) => {
  try {
    const { status, damageNotes } = req.body;
    const rental = await Rental.findByPk(req.params.id, { include: [{ model: Product, as: 'product' }] });
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    const wasTerminal = TERMINAL_STATUSES.includes(rental.status);
    const willBeTerminal = TERMINAL_STATUSES.includes(status);

    rental.status = status;
    if (damageNotes !== undefined) rental.damageNotes = damageNotes;
    if (status === 'return_requested') rental.returnRequested = true;
    await rental.save();

    // Restock the unit once a rental reaches a terminal state
    if (!wasTerminal && willBeTerminal && rental.product) {
      rental.product.availableUnits += 1;
      await rental.product.save();
    }

    res.json(rental);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rentals/:id/return  (customer requests pickup/return)
const requestReturn = async (req, res, next) => {
  try {
    const rental = await Rental.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    rental.returnRequested = true;
    rental.status = 'return_requested';
    await rental.save();

    res.json(rental);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rentals/:id/extend  (customer extends tenure)
// body: { additionalMonths }
const extendRental = async (req, res, next) => {
  try {
    const { additionalMonths } = req.body;
    if (!additionalMonths || additionalMonths < 1) {
      return res.status(400).json({ message: 'additionalMonths must be at least 1' });
    }

    const rental = await Rental.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    if (['completed', 'cancelled', 'return_requested'].includes(rental.status)) {
      return res.status(400).json({ message: `Cannot extend a rental that is ${rental.status}` });
    }

    const newEnd = new Date(rental.endDate);
    newEnd.setMonth(newEnd.getMonth() + Number(additionalMonths));

    rental.tenureMonths += Number(additionalMonths);
    rental.endDate = newEnd.toISOString().slice(0, 10);
    await rental.save();

    res.json(rental);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRentals,
  getMyRentals,
  getAllRentals,
  updateRentalStatus,
  requestReturn,
  extendRental,
};
