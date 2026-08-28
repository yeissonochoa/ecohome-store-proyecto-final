/**
 * src/domain/repositories/IUserRepository.js
 * -----------------------------------------------------------------------
 * "Puerto" del patrón Repository. Define el contrato que cualquier
 * adaptador de persistencia (PostgreSQL, Mongo, memoria para tests...)
 * debe cumplir. Los casos de uso dependen de ESTA interfaz, nunca de
 * una implementación concreta (Inversión de Dependencias).
 * -----------------------------------------------------------------------
 */
class IUserRepository {
  /* eslint-disable no-unused-vars, class-methods-use-this */

  /** @param {string} email @returns {Promise<User|null>} */
  async findByEmail(email) {
    throw new Error('IUserRepository.findByEmail no implementado');
  }

  /** @param {string} id @returns {Promise<User|null>} */
  async findById(id) {
    throw new Error('IUserRepository.findById no implementado');
  }

  /** @param {User} user @returns {Promise<User>} */
  async create(user) {
    throw new Error('IUserRepository.create no implementado');
  }
}

module.exports = IUserRepository;
