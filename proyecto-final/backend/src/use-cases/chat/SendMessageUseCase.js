/**
 * src/use-cases/chat/SendMessageUseCase.js
 * -----------------------------------------------------------------------
 * Orquesta el envío de un mensaje: valida y persiste ANTES de reenviarlo
 * (requisito explícito del enunciado: "Cada new-message recibido se
 * guarda en DB antes de reenviarse"). El broadcast por Socket.IO ocurre
 * en la capa de interfaces (socket handler), no aquí: este caso de uso
 * no conoce Socket.IO.
 * -----------------------------------------------------------------------
 */
const { Message } = require('../../domain/entities/Message');

class SendMessageUseCase {
  /** @param {IMessageRepository} messageRepository */
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  /** @param {{userId: string, username: string, text: string}} input */
  async execute({ userId, username, text }) {
    const message = new Message({ userId, username, text });
    const saved = await this.messageRepository.create(message);
    return saved.toPublicJSON();
  }
}

module.exports = SendMessageUseCase;
