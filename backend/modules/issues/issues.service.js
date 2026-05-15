const Issue = require('./issues.model');
const AppError = require('../../utils/AppError');
const { uploadToCloudinary } = require('../../utils/imageUpload');
const leaderboardService = require('../leaderboard/leaderboard.service');

// Valid lifecycle transitions
const TRANSITIONS = {
  Reported: 'Assigned',
  Assigned: 'In Progress',
  'In Progress': 'Resolved',
  Resolved: 'Verified',
};

const createIssue = async (userId, { title, description, imageBuffer, imageMime, imageUrl: providedUrl, lat, lng }) => {
  // If a file buffer was uploaded, push to Cloudinary; otherwise use the provided URL directly
  let imageUrl = providedUrl;
  if (imageBuffer) {
    imageUrl = await uploadToCloudinary(imageBuffer, imageMime);
  }
  if (!imageUrl) throw new AppError('Image is required', 400);

  const issue = await Issue.create({
    title,
    description,
    imageUrl,
    location: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON: [lng, lat]
    },
    status: 'Reported',
    reporterId: userId,
  });

  return issue;
};

const getNearby = async (lat, lng, radiusMeters = 5000, limit = 50) => {
  const issues = await Issue.find({
    deletedAt: null,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radiusMeters),
      },
    },
  }).limit(limit);
  return issues;
};

const getById = async (id) => {
  const issue = await Issue.findOne({ _id: id, deletedAt: null });
  if (!issue) throw new AppError('Issue not found', 404);
  return issue;
};

const updateIssue = async (id, userId, role, data) => {
  const issue = await Issue.findOne({ _id: id, deletedAt: null });
  if (!issue) throw new AppError('Issue not found', 404);

  const isOwner = issue.reporterId.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new AppError('Forbidden: you do not have permission to update this issue', 403);
  }

  const allowed = ['title', 'description', 'imageUrl'];
  allowed.forEach((field) => {
    if (data[field] !== undefined) issue[field] = data[field];
  });

  await issue.save();
  return issue;
};

const softDelete = async (id, userId, role) => {
  const issue = await Issue.findOne({ _id: id, deletedAt: null });
  if (!issue) throw new AppError('Issue not found', 404);

  const isOwner = issue.reporterId.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new AppError('Forbidden: you do not have permission to delete this issue', 403);
  }

  issue.deletedAt = new Date();
  await issue.save();
};

const updateStatus = async (id, userId, role, newStatus) => {
  const issue = await Issue.findOne({ _id: id, deletedAt: null });
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
  return issue;
};

const verifyIssue = async (id) => {
  const issue = await Issue.findOne({ _id: id, deletedAt: null });
  if (!issue) throw new AppError('Issue not found', 404);
  if (issue.status !== 'Resolved') {
    throw new AppError('Issue is not resolved', 400);
  }
  issue.status = 'Verified';
  await issue.save();

  // Award +5 points to the assigned volunteer on verification
  // Non-blocking: a points failure should not fail the verify operation
  if (issue.assigneeId) {
    leaderboardService.addPoints(issue.assigneeId, 5).catch((e) =>
      console.error('Failed to award verify points:', e)
    );
  }

  return issue;
};

module.exports = { createIssue, getNearby, getById, updateIssue, softDelete, updateStatus, verifyIssue };
