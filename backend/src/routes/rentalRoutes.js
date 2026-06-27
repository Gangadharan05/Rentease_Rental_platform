const express = require('express');
const router = express.Router();
const {
  createRentals,
  getMyRentals,
  getAllRentals,
  updateRentalStatus,
  requestReturn,
  extendRental,
} = require('../controllers/rentalController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createRentals);
router.get('/my', protect, getMyRentals);
router.get('/', protect, adminOnly, getAllRentals);
router.put('/:id/status', protect, adminOnly, updateRentalStatus);
router.post('/:id/return', protect, requestReturn);
router.post('/:id/extend', protect, extendRental);

module.exports = router;
