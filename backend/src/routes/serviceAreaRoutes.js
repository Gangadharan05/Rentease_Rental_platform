const express = require('express');
const router = express.Router();
const {
  getServiceAreas,
  getAllServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
} = require('../controllers/serviceAreaController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getServiceAreas);
router.get('/all', protect, adminOnly, getAllServiceAreas);
router.post('/', protect, adminOnly, createServiceArea);
router.put('/:id', protect, adminOnly, updateServiceArea);
router.delete('/:id', protect, adminOnly, deleteServiceArea);

module.exports = router;
