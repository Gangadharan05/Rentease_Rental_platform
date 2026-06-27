const { MaintenanceRequest, Rental, Product, User } = require('../models');

// @route   POST /api/maintenance  (customer)
// body: { rentalId, issueDescription }
const createRequest = async (req, res, next) => {
  try {
    const { rentalId, issueDescription } = req.body;
    if (!rentalId || !issueDescription) {
      return res.status(400).json({ message: 'rentalId and issueDescription are required' });
    }

    const rental = await Rental.findOne({ where: { id: rentalId, userId: req.user.id } });
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found for this account' });
    }

    const request = await MaintenanceRequest.create({
      rentalId,
      userId: req.user.id,
      issueDescription,
    });

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/maintenance/my  (customer)
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await MaintenanceRequest.findAll({
      where: { userId: req.user.id },
      include: [{ model: Rental, as: 'rental', include: [{ model: Product, as: 'product' }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/maintenance  (admin)
const getAllRequests = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const requests = await MaintenanceRequest.findAll({
      where,
      include: [
        { model: Rental, as: 'rental', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/maintenance/:id  (admin)
// body: { status, resolutionNotes? }
const updateRequest = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Maintenance request not found' });

    if (status) request.status = status;
    if (resolutionNotes !== undefined) request.resolutionNotes = resolutionNotes;
    if (status === 'resolved') request.resolvedAt = new Date();

    await request.save();
    res.json(request);
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequest };
