const Sponsorship = require('./sponsorship.model');
const Issue = require('../issues/issues.model');
const AppError = require('../../utils/AppError');

const TRANSITIONS = {
  pending: 'active',
  active: 'completed',
};

const createSponsorship = async (issueId, sponsorName, amount, userId) => {
  const issue = await Issue.findOne({ _id: issueId, deletedAt: null });
  if (!issue) throw new AppError('Issue not found', 404);

  const sponsorship = await Sponsorship.create({
    issueId,
    sponsorName,
    amount,
    status: 'pending',
    createdBy: userId,
  });

  return sponsorship;
};

const updateStatus = async (id, newStatus) => {
  const sponsorship = await Sponsorship.findById(id);
  if (!sponsorship) throw new AppError('Sponsorship not found', 404);

  const expectedNext = TRANSITIONS[sponsorship.status];
  if (!expectedNext || expectedNext !== newStatus) {
    throw new AppError(
      `Invalid transition: '${sponsorship.status}' cannot move to '${newStatus}'. Expected: '${expectedNext || 'none'}'`,
      400
    );
  }

  sponsorship.status = newStatus;
  await sponsorship.save();
  return sponsorship;
};

module.exports = { createSponsorship, updateStatus };
