/**
 * src/infrastructure/utils/AppError.js
 * -----------------------------------------------------------------------
 * Error de aplicación con código HTTP asociado. Todos los casos de uso
 * y controladores lanzan/propagan este tipo de error para que el
 * middleware centralizado de manejo de errores (errorHandler) pueda
 * traducirlo a una respuesta HTTP coherente sin repetir try/catch
 * en cada handler.
 * -----------------------------------------------------------------------
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true; // distingue errores esperados de bugs
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'No autenticado.') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'No autorizado para realizar esta acción.') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Recurso no encontrado.') {
    return new AppError(message, 404);
  }

  static conflict(message) {
    return new AppError(message, 409);
  }
}

module.exports = AppError;
