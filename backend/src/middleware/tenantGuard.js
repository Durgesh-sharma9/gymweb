import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';

export const tenantGuard = (req, res, next) => {
  if (req.user.role === ROLES.SUPER_ADMIN) return next();

  const gymIdFromParams = req.params.gymId || req.body.gymId || req.query.gymId;
  if (gymIdFromParams && gymIdFromParams !== req.user.gymId?.toString()) {
    return next(new ApiError(403, 'Access denied to this gym'));
  }

  req.gymId = req.user.gymId;
  next();
};

export const injectGymId = (req, res, next) => {
  if (req.user.role !== ROLES.SUPER_ADMIN) {
    if (!req.user.gymId) {
      return next(new ApiError(400, 'Authenticated user has no gym assigned. Please complete gym setup or contact support.'));
    }
    req.gymId = req.user.gymId;
  }
  next();
};
