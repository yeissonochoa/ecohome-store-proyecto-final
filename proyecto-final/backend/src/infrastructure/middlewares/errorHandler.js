/**
 * src/infrastructure/middlewares/errorHandler.js
 * -----------------------------------------------------------------------
 * Manejo centralizado de errores (Clean Code: evita try/catch repetido
 * en cada controlador). Todo `next(err)` termina aquí.
 *
 * Traduce:
 *  - AppError (y subclases)      -> statusCode propio
 *  - Violación de UNIQUE (email) -> 409 Conflict
 *  - Error de validación Product -> 400 Bad Request
 *  - Cualquier otro error        -> 500 Internal Server Error
 * -----------------------------------------------------------------------
 */
const env = require('../../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor.';

  // Violación de restricción UNIQUE de PostgreSQL (p. ej. email duplicado)
  if (err.code === '23505') {
    statusCode = 409;
    message = 'El recurso ya existe (valor duplicado).';
  }

  // Violación de restricción CHECK de PostgreSQL (p. ej. price > 0)
  if (err.code === '23514') {
    statusCode = 400;
    message = 'Los datos enviados no cumplen las reglas de negocio (revisa price/stock).';
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  const body = {
    success: false,
    error: {
      message,
      ...(env.nodeEnv === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  };

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
