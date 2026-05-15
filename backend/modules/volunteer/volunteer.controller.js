const volunteerService = require('./volunteer.service');

const accept = async (req, res, next) => {
  try {
    const issue = await volunteerService.acceptIssue(req.params.issueId, req.user.id);
    res.status(201).json({ status: 'success', data: issue });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const issue = await volunteerService.updateStatus(
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

const getAssigned = async (req, res, next) => {
  try {
    const issues = await volunteerService.getAssigned(req.user.id);
    res.status(200).json({ status: 'success', data: issues });
  } catch (err) {
    next(err);
  }
};

module.exports = { accept, updateStatus, getAssigned };
