/**
 * src/infrastructure/middlewares/authJWT.js
 * -----------------------------------------------------------------------
 * Verifica el header `Authorization: Bearer <token>`. Si es válido,
 * adjunta el payload decodificado a `req.user` para que middlewares y
 * controladores posteriores (p. ej. authorizeRole) puedan usarlo.
 * -----------------------------------------------------------------------
 */
const TokenService = require('../security/TokenService');
const AppError = require('../utils/AppError');

function authJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Token no proporcionado. Usa el header Authorization: Bearer <token>.'));
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const payload = TokenService.verify(token);
    req.user = payload; // { id, email, role, iat, exp }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('El token ha expirado. Inicia sesión nuevamente.'));
    }
    return next(AppError.unauthorized('Token inválido.'));
  }
}

module.exports = authJWT;
