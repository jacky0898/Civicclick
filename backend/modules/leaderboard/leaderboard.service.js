const LeaderboardPoints = require('./leaderboard.model');

/**
 * Upsert points for a volunteer.
 * Called by volunteer service (resolve +10) and issues service (verify +5).
 */
const addPoints = async (userId, points) => {
  return LeaderboardPoints.findOneAndUpdate(
    { userId },
    { $inc: { totalPoints: points }, $set: { updatedAt: new Date() } },
    { upsert: true, new: true }
  );
};

/**
 * Return all volunteers ranked by total points descending.
 * Joins with Users collection to include display name.
 */
const getLeaderboard = async () => {
  return LeaderboardPoints.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: { $toString: '$userId' },
        name: '$user.name',
        totalPoints: 1,
      },
    },
    { $sort: { totalPoints: -1 } },
  ]);
};

module.exports = { addPoints, getLeaderboard };
