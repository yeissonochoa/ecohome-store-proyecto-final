/**
 * src/interfaces/validators/authValidator.js
 * -----------------------------------------------------------------------
 * Validación de forma (shape) de la petición HTTP, antes de llegar al
 * caso de uso. Es una primera línea de defensa "barata"; las reglas de
 * negocio más finas viven en los casos de uso / entidades de dominio.
 * -----------------------------------------------------------------------
 */
const AppError = require('../../infrastructure/utils/AppError');

function validateSignupPayload(req, res, next) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return next(AppError.badRequest('Los campos name, email y password son obligatorios.'));
  }
  return next();
}

function validateLoginPayload(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return next(AppError.badRequest('Los campos email y password son obligatorios.'));
  }
  return next();
}

module.exports = { validateSignupPayload, validateLoginPayload };
