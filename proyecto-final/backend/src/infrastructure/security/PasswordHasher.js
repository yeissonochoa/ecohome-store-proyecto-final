/**
 * src/infrastructure/security/PasswordHasher.js
 * -----------------------------------------------------------------------
 * Adaptador que envuelve bcrypt. Los casos de uso dependen de esta
 * clase (no de bcrypt directamente), lo que permite reemplazar el
 * algoritmo de hashing sin tocar la lógica de negocio.
 * -----------------------------------------------------------------------
 */
const bcrypt = require('bcrypt');
const env = require('../../config/env');

class PasswordHasher {
  /** @param {string} plainPassword @returns {Promise<string>} */
  static async hash(plainPassword) {
    return bcrypt.hash(plainPassword, env.bcrypt.saltRounds);
  }

  /**
   * @param {string} plainPassword
   * @param {string} passwordHash
   * @returns {Promise<boolean>}
   */
  static async compare(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}

module.exports = PasswordHasher;
