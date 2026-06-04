const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const linkController = require('../controllers/linkController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const Joi = require('joi');

// Configure temporary file directory for bulk CSV ingestion
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Only CSV formats are permitted for link bulk uploader.'));
    }
    cb(null, true);
  }
});

const createSchema = Joi.object({
  originalUrl: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  customAlias: Joi.string().alphanum().min(3).max(20).optional().allow(''),
  expiresAt: Joi.date().greater('now').optional().allow(null, ''),
  clickLimit: Joi.number().integer().min(1).optional().allow(null, '')
});

const updateSchema = Joi.object({
  expiresAt: Joi.date().greater('now').optional().allow(null, ''),
  clickLimit: Joi.number().integer().min(1).optional().allow(null, ''),
  isPublicStats: Joi.boolean().optional()
});

router.post('/create', protect, validate(createSchema), linkController.create);
router.get('/list', protect, linkController.list);
router.patch('/:id/toggle', protect, linkController.toggleStatus);
router.patch('/:id/settings', protect, validate(updateSchema), linkController.updateLinkSettings);
router.delete('/:id', protect, linkController.deleteLink);
router.post('/bulk-import', protect, upload.single('file'), linkController.bulkImport);

module.exports = router;
