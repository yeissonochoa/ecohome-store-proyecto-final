/**
 * src/infrastructure/middlewares/authorizeRole.js
 * -----------------------------------------------------------------------
 * Middleware "factory" para RBAC (Role-Based Access Control).
 * Debe usarse SIEMPRE después de authJWT, ya que depende de req.user.
 *
 * Uso: router.post('/products', authJWT, authorizeRole('admin'), controller)
 * -----------------------------------------------------------------------
 */
const AppError = require('../utils/AppError');

function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('No autenticado.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(`Rol '${req.user.role}' no autorizado. Se requiere uno de: ${allowedRoles.join(', ')}.`)
      );
    }

    return next();
  };
}

module.exports = authorizeRole;
