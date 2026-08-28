/**
 * src/domain/entities/User.js
 * -----------------------------------------------------------------------
 * Entidad de dominio pura. No conoce Express, ni PostgreSQL, ni JWT.
 * Encapsula las reglas de negocio propias del concepto "Usuario".
 * -----------------------------------------------------------------------
 */

const ROLES = Object.freeze({
  ADMIN: 'admin',
  CLIENT: 'client',
});

class User {
  /**
   * @param {Object} props
   * @param {string} props.id
   * @param {string} props.name
   * @param {string} props.email
   * @param {string} props.passwordHash
   * @param {string} [props.role]
   * @param {Date|string} [props.createdAt]
   */
  constructor({ id, name, email, passwordHash, role = ROLES.CLIENT, createdAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = createdAt;
  }

  isAdmin() {
    return this.role === ROLES.ADMIN;
  }

  /** Representación segura para exponer en respuestas HTTP (nunca el hash). */
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { User, ROLES };
