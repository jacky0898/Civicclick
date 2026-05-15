const { Router } = require('express');
const { body, query } = require('express-validator');
const controller = require('./issues.controller');
const authenticate = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const validate = require('../../middleware/validate.middleware');
const { uploadMiddleware } = require('../../utils/imageUpload');

const router = Router();

// Wrap multer so it doesn't fail on JSON-only requests (no multipart boundary)
const optionalUpload = (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    return uploadMiddleware(req, res, next);
  }
  next();
};

// POST /issues — create issue (citizen only; accepts multipart OR JSON with imageUrl)
router.post(
  '/',
  authenticate,
  requireRole('citizen'),
  optionalUpload,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('lat').notEmpty().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('lng').notEmpty().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  ],
  validate,
  controller.create
);

// GET /issues/nearby — must be before /:id to avoid route conflict
router.get(
  '/nearby',
  authenticate,
  [
    query('lat').notEmpty().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    query('lng').notEmpty().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
    query('radius').optional().isFloat({ min: 1 }).withMessage('Radius must be a positive number'),
  ],
  validate,
  controller.getNearby
);

// GET /issues/:id
router.get('/:id', authenticate, controller.getById);

// PATCH /issues/:id/status — lifecycle update (assigned volunteer or admin)
// MUST be registered BEFORE /:id to avoid Express treating "status" as an id param
router.patch(
  '/:id/status',
  authenticate,
  requireRole('volunteer', 'admin'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  controller.updateStatus
);

// PATCH /issues/:id/verify — admin only — MUST be before /:id
router.patch('/:id/verify', authenticate, requireRole('admin'), controller.verifyIssue);

// PATCH /issues/:id — update title/description/imageUrl (reporter or admin)
router.patch('/:id', authenticate, controller.update);

// DELETE /issues/:id — soft delete (reporter or admin)
router.delete('/:id', authenticate, controller.softDelete);

module.exports = router;
