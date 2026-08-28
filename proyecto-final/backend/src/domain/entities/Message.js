/**
 * src/domain/entities/Message.js
 * -----------------------------------------------------------------------
 * Entidad de dominio "Mensaje de chat". Misma filosofía que User y
 * Product: valida sus propias invariantes (texto no vacío) y no conoce
 * Socket.IO ni PostgreSQL.
 * -----------------------------------------------------------------------
 */

class MessageValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MessageValidationError';
    this.statusCode = 400;
  }
}

class Message {
  /**
   * @param {Object} props
   * @param {string} [props.id]
   * @param {string} props.userId
   * @param {string} props.username
   * @param {string} props.text
   * @param {Date|string} [props.createdAt]
   */
  constructor({ id, userId, username, text, createdAt }) {
    Message.validate({ text });

    this.id = id;
    this.userId = userId;
    this.username = username;
    this.text = text.trim();
    this.createdAt = createdAt;
  }

  static validate({ text }) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new MessageValidationError('El mensaje no puede estar vacío.');
    }
    if (text.trim().length > 2000) {
      throw new MessageValidationError('El mensaje no puede superar los 2000 caracteres.');
    }
  }

  /** Forma que se envía por Socket.IO y por cualquier endpoint HTTP de verificación. */
  toPublicJSON() {
    return {
      id: this.id,
      userId: this.userId,
      username: this.username,
      text: this.text,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { Message, MessageValidationError };
