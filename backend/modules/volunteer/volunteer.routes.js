const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./volunteer.controller');
const authenticate = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

// POST /volunteer/accept/:issueId — atomically claim an issue
router.post(
  '/accept/:issueId',
  authenticate,
  requireRole('volunteer'),
  controller.accept
);

// GET /volunteer/assigned — list issues assigned to this volunteer
router.get(
  '/assigned',
  authenticate,
  requireRole('volunteer'),
  controller.getAssigned
);

// PATCH /volunteer/status/:id — advance issue status (Assigned → In Progress → Resolved)
router.patch(
  '/status/:id',
  authenticate,
  requireRole('volunteer', 'admin'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  controller.updateStatus
);

module.exports = router;
