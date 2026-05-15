const Issue = require('../issues/issues.model');
const AppError = require('../../utils/AppError');
const leaderboardService = require('../leaderboard/leaderboard.service');

// Valid transitions for volunteers (admin can also trigger Resolved → Verified via verify route)
const TRANSITIONS = {
  Assigned: 'In Progress',
  'In Progress': 'Resolved',
};

/**
 * Atomically accept an issue.
 * Uses findOneAndUpdate with a condition on status + assigneeId to prevent race conditions.
 */
const acceptIssue = async (issueId, volunteerId) => {
  const issue = await Issue.findOneAndUpdate(
    { _id: issueId, status: 'Reported', assigneeId: null, deletedAt: null },
    { status: 'Assigned', assigneeId: volunteerId },
    { new: true }
  );

  if (!issue) {
    // Could be not found OR already assigned — check which
    const exists = await Issue.findOne({ _id: issueId, deletedAt: null });
    if (!exists) throw new AppError('Issue not found', 404);
    throw new AppError('Issue is already assigned', 409);
  }

  return issue;
};

/**
 * Update issue status along the volunteer lifecycle.
 * Only the assigned volunteer or an admin may do this.
 */
const updateStatus = async (issueId, userId, role, newStatus) => {
  const issue = await Issue.findOne({ _id: issueId, deletedAt: null });
  if (!issue) throw new AppError('Issue not found', 404);

  const isAssignee = issue.assigneeId && issue.assigneeId.toString() === userId.toString();
  if (!isAssignee && role !== 'admin') {
    throw new AppError('Forbidden: only the assigned volunteer or admin can update status', 403);
  }

  const expectedNext = TRANSITIONS[issue.status];
  if (!expectedNext || expectedNext !== newStatus) {
    throw new AppError(
      `Invalid transition: '${issue.status}' cannot move to '${newStatus}'. Expected: '${expectedNext || 'none'}'`,
      400
    );
  }

  issue.status = newStatus;
  await issue.save();

  // Award +10 points when volunteer resolves an issue
  // Non-blocking: a points failure should not fail the status update
  if (newStatus === 'Resolved') {
    leaderboardService.addPoints(issue.assigneeId, 10).catch((e) =>
      console.error('Failed to award resolve points:', e)
    );
  }

  return issue;
};

/**
 * Get all non-deleted issues assigned to this volunteer.
 */
const getAssigned = async (volunteerId) => {
  return Issue.find({ assigneeId: volunteerId, deletedAt: null }).sort({ createdAt: -1 });
};

module.exports = { acceptIssue, updateStatus, getAssigned };
