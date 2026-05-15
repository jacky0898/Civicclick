const AppError = require('../utils/AppError');

/**
 * Role-based access control middleware factory.
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
};

module.exports = requireRole;
