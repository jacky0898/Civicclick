const leaderboardService = require('./leaderboard.service');

const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await leaderboardService.getLeaderboard();
    res.status(200).json({ status: 'success', data: leaderboard });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard };
