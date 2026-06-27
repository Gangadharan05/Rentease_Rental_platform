const { Op } = require('sequelize');
const { Product } = require('../models');

// @route   GET /api/products
// Supports ?category=furniture&subCategory=sofa&search=chair
const getProducts = async (req, res, next) => {
  try {
    const { category, subCategory, search, _all } = req.query;
    const where = {};
    if (!_all) where.status = 'active';

    if (category) where.category = category;
    if (subCategory) where.subCategory = subCategory;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });

    const withTenurePricing = products.map((p) => attachTenurePricing(p));
    res.json(withTenurePricing);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(attachTenurePricing(product));
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/products (admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      subCategory,
      description,
      imageUrl,
      baseMonthlyRent,
      securityDeposit,
      tenureOptions,
      totalUnits,
    } = req.body;

    if (!name || !category || !subCategory || !baseMonthlyRent || !securityDeposit) {
      return res.status(400).json({ message: 'Missing required product fields' });
    }

    const product = await Product.create({
      name,
      category,
      subCategory,
      description,
      imageUrl,
      baseMonthlyRent,
      securityDeposit,
      tenureOptions: tenureOptions && tenureOptions.length ? tenureOptions : [3, 6, 12],
      totalUnits: totalUnits || 1,
      availableUnits: totalUnits || 1,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/products/:id (admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const fields = [
      'name',
      'category',
      'subCategory',
      'description',
      'imageUrl',
      'baseMonthlyRent',
      'securityDeposit',
      'tenureOptions',
      'totalUnits',
      'availableUnits',
      'status',
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/products/:id (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// Helper: attach computed pricing per tenure option so the frontend
// can display "3 months - ₹X/mo", "12 months - ₹Y/mo" etc.
function attachTenurePricing(product) {
  const json = product.toJSON();
  json.tenurePricing = (json.tenureOptions || []).map((months) => ({
    months,
    monthlyRent: product.getMonthlyRentForTenure(months),
  }));
  return json;
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
