/**
 * src/interfaces/controllers/MessageController.js
 * -----------------------------------------------------------------------
 * Endpoint HTTP de solo lectura, protegido, que sirve como "evidencia:
 * consulta SQL o endpoint de verificación mostrando mensajes
 * almacenados" (Actividad 2 del enunciado). No participa en el chat en
 * vivo (eso lo maneja chatSocket.js): es exclusivamente una forma de
 * comprobar desde Postman/curl que los mensajes SÍ quedan en PostgreSQL.
 * -----------------------------------------------------------------------
 */
const PostgresMessageRepository = require('../../infrastructure/repositories/PostgresMessageRepository');
const GetRecentMessagesUseCase = require('../../use-cases/chat/GetRecentMessagesUseCase');

const messageRepository = new PostgresMessageRepository();
const getRecentMessagesUseCase = new GetRecentMessagesUseCase(messageRepository);

class MessageController {
  static async getRecent(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const messages = await getRecentMessagesUseCase.execute(limit);
      return res.status(200).json({ success: true, data: messages });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = MessageController;
