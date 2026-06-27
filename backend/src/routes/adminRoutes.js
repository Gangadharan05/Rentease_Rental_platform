const express = require('express');
const router = express.Router();
const { getReports, getUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/reports', protect, adminOnly, getReports);
router.get('/users', protect, adminOnly, getUsers);

module.exports = router;
