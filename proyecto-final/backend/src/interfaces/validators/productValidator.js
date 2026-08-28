/**
 * src/interfaces/validators/productValidator.js
 * -----------------------------------------------------------------------
 * Valida la forma del body en creación/actualización de productos.
 * La regla "price > 0" se re-valida en la entidad de dominio (Product),
 * pero validarla aquí también permite devolver 400 con un mensaje claro
 * antes de instanciar nada.
 * -----------------------------------------------------------------------
 */
const AppError = require('../../infrastructure/utils/AppError');

function validateCreateProduct(req, res, next) {
  const { name, price } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return next(AppError.badRequest('El campo name es obligatorio y no puede estar vacío.'));
  }

  const numericPrice = Number(price);
  if (price === undefined || Number.isNaN(numericPrice) || numericPrice <= 0) {
    return next(AppError.badRequest('El campo price es obligatorio y debe ser un número mayor a 0.'));
  }

  return next();
}

function validateUpdateProduct(req, res, next) {
  const { name, price } = req.body || {};

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return next(AppError.badRequest('El campo name, si se envía, no puede estar vacío.'));
  }

  if (price !== undefined) {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return next(AppError.badRequest('El campo price, si se envía, debe ser un número mayor a 0.'));
    }
  }

  return next();
}

module.exports = { validateCreateProduct, validateUpdateProduct };
