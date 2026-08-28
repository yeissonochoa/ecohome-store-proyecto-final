/**
 * src/domain/repositories/IMessageRepository.js
 * -----------------------------------------------------------------------
 * Puerto del patrón Repository para la entidad Message.
 * -----------------------------------------------------------------------
 */
class IMessageRepository {
  /* eslint-disable no-unused-vars, class-methods-use-this */

  /** @param {Message} message @returns {Promise<Message>} */
  async create(message) {
    throw new Error('IMessageRepository.create no implementado');
  }

  /**
   * Últimos N mensajes, en orden cronológico ascendente (para renderizar
   * el historial de arriba hacia abajo tal como se leería un chat).
   * @param {number} limit
   * @returns {Promise<Message[]>}
   */
  async findLast(limit) {
    throw new Error('IMessageRepository.findLast no implementado');
  }
}

module.exports = IMessageRepository;
