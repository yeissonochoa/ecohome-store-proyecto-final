/**
 * src/use-cases/chat/GetRecentMessagesUseCase.js
 * -----------------------------------------------------------------------
 * Trae el historial inicial que cada usuario debe ver al conectarse
 * ("últimos 10 mensajes", exigido por el enunciado). El límite es
 * configurable para reutilizar el caso de uso también en el endpoint
 * HTTP de verificación (Actividad 2).
 * -----------------------------------------------------------------------
 */
class GetRecentMessagesUseCase {
  /** @param {IMessageRepository} messageRepository */
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  /** @param {number} [limit=10] */
  async execute(limit = 10) {
    const messages = await this.messageRepository.findLast(limit);
    return messages.map((m) => m.toPublicJSON());
  }
}

module.exports = GetRecentMessagesUseCase;
