const issuesService = require('./issues.service');

const create = async (req, res, next) => {
  try {
    const { title, description, imageUrl, lat, lng } = req.body;

    // Support both multipart file upload and plain JSON with imageUrl
    const payload = {
      title,
      description,
      lat,
      lng,
      imageUrl: imageUrl || undefined,
      imageBuffer: req.file ? req.file.buffer : undefined,
      imageMime: req.file ? req.file.mimetype : undefined,
    };

    if (!payload.imageUrl && !payload.imageBuffer) {
      return res.status(400).json({ status: 'error', message: 'Image file or imageUrl is required' });
    }

    const issue = await issuesService.createIssue(req.user.id, payload);
    res.status(201).json({ status: 'success', data: issue });
  } catch (err) {
    next(err);
  }
};

const getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;
    const issues = await issuesService.getNearby(lat, lng, radius);
    res.status(200).json({ status: 'success', data: issues });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const issue = await issuesService.getById(req.params.id);
    res.status(200).json({ status: 'success', data: issue });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const issue = await issuesService.updateIssue(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json({ status: 'success', data: issue });
  } catch (err) {
    next(err);
  }
};

const softDelete = async (req, res, next) => {
  try {
    await issuesService.softDelete(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ status: 'success', message: 'Issue deleted' });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const issue = await issuesService.updateStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.status(200).json({ status: 'success', data: issue });
  } catch (err) {
    next(err);
  }
};

const verifyIssue = async (req, res, next) => {
  try {
    const issue = await issuesService.verifyIssue(req.params.id);
    res.status(200).json({ status: 'success', data: issue });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getNearby, getById, update, softDelete, updateStatus, verifyIssue };
