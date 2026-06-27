const { ServiceArea } = require('../models');

// @route   GET /api/service-areas  (public - used to populate delivery city dropdown)
const getServiceAreas = async (req, res, next) => {
  try {
    const areas = await ServiceArea.findAll({ where: { isActive: true }, order: [['city', 'ASC']] });
    res.json(areas);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/service-areas/all  (admin - includes inactive)
const getAllServiceAreas = async (req, res, next) => {
  try {
    const areas = await ServiceArea.findAll({ order: [['city', 'ASC']] });
    res.json(areas);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/service-areas  (admin)
const createServiceArea = async (req, res, next) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ message: 'City is required' });

    const area = await ServiceArea.create({ city });
    res.status(201).json(area);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/service-areas/:id  (admin)
const updateServiceArea = async (req, res, next) => {
  try {
    const area = await ServiceArea.findByPk(req.params.id);
    if (!area) return res.status(404).json({ message: 'Service area not found' });

    if (req.body.city !== undefined) area.city = req.body.city;
    if (req.body.isActive !== undefined) area.isActive = req.body.isActive;
    await area.save();

    res.json(area);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/service-areas/:id  (admin)
const deleteServiceArea = async (req, res, next) => {
  try {
    const area = await ServiceArea.findByPk(req.params.id);
    if (!area) return res.status(404).json({ message: 'Service area not found' });
    await area.destroy();
    res.json({ message: 'Service area removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServiceAreas,
  getAllServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
};
