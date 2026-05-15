const sponsorshipService = require('./sponsorship.service');

const create = async (req, res, next) => {
  try {
    const { issueId, sponsorName, amount } = req.body;
    const sponsorship = await sponsorshipService.createSponsorship(
      issueId,
      sponsorName,
      amount,
      req.user.id
    );
    res.status(201).json({ status: 'success', data: sponsorship });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const sponsorship = await sponsorshipService.updateStatus(req.params.id, req.body.status);
    res.status(200).json({ status: 'success', data: sponsorship });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, updateStatus };
