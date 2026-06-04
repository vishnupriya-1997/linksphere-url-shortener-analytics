const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/overview', protect, analyticsController.overview);
router.get('/:id', protect, analyticsController.linkStats);
router.get('/:id/export', protect, analyticsController.exportData);
router.get('/public/:shortCode', analyticsController.publicStats);

module.exports = router;
