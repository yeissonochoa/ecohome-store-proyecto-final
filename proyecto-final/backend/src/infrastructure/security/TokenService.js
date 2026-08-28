/**
 * src/infrastructure/security/TokenService.js
 * -----------------------------------------------------------------------
 * Adaptador de firma/verificación de JWT. Al ser stateless (no depende
 * de sesiones en el servidor), el mismo token puede ser consumido por
 * el cliente web, la app móvil o servicios externos, cumpliendo el
 * requisito de "autenticación que no dependa de mantener estado en el
 * servidor".
 * -----------------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

class TokenService {
  /**
   * Genera un JWT firmado con el payload mínimo necesario (id, email, role).
   * Nunca se incluye el password_hash en el payload.
   * @param {{id: string, email: string, role: string}} payload
   * @returns {string}
   */
  static sign(payload) {
    return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
  }

  /**
   * Verifica y decodifica un token. Lanza si es inválido o expiró.
   * @param {string} token
   */
  static verify(token) {
    return jwt.verify(token, env.jwt.secret);
  }
}

module.exports = TokenService;
