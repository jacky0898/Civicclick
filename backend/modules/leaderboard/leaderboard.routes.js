const { Router } = require('express');
const controller = require('./leaderboard.controller');

const router = Router();

// GET /leaderboard — public, no auth required
router.get('/', controller.getLeaderboard);

module.exports = router;
