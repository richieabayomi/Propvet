const ApiResponse = require('../../misc/services/api-response');
const AuthorizationError = require('../errors/AuthorizationError');
const { verifySignedAuthToken } = require('../services/jwt');

const excludedPaths = ['healthCheck', 'apiHealth'];

/**
 * Middleware for authenticating users and optionally enforcing role-based access.
 * 
 * Usage:
 *   router.get('/admin', authorizationMiddleware(['ADMIN']), controllerMethod);
 *   router.get('/profile', authorizationMiddleware(), controllerMethod); // no role restriction
 * 
 * @param {string[]} allowedRoles - Optional array of allowed roles (e.g., ['ADMIN'])
 */
module.exports = function authorizationMiddleware(allowedRoles = []) {
  return function (req, res, next) {
    const requestURLPaths = req.path.split('/');
    const authorization = (req.headers && req.headers.authorization) || '';

    // Skip token check for whitelisted paths
    if (!excludedPaths.includes(requestURLPaths[2]) && req.path !== '/signup') {
      const isEmptyToken = (
        !authorization ||
        !authorization.startsWith('Bearer ')
      );

      if (isEmptyToken) {
        return ApiResponse.error(res,
          new AuthorizationError('Auth bearer token is required')
        );
      }

      const token = authorization.split('Bearer ')[1];
      const jwtPayload = verifySignedAuthToken(token);

      if (!jwtPayload) {
        return ApiResponse.error(res, new AuthorizationError('Invalid or expired token.'));
      }

      req.currentUser = jwtPayload;

      // ✅ Role check (if roles are specified)
      if (
        Array.isArray(allowedRoles) &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(jwtPayload.role)
      ) {
        return ApiResponse.error(res,
          new AuthorizationError('Access denied. Insufficient role privileges.')
        );
      }
    }

    return next();
  };
};
