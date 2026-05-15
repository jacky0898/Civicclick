const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./sponsorship.controller');
const authenticate = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

// POST /sponsorship — any authenticated user can create
router.post(
  '/',
  authenticate,
  [
    body('issueId').notEmpty().withMessage('issueId is required'),
    body('sponsorName').notEmpty().withMessage('sponsorName is required'),
    body('amount').isNumeric().withMessage('amount must be a number'),
  ],
  validate,
  controller.create
);

// PATCH /sponsorship/:id — admin only, update status
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  [body('status').notEmpty().withMessage('status is required')],
  validate,
  controller.updateStatus
);

module.exports = router;
