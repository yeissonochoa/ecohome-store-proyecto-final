/**
 * src/infrastructure/repositories/PostgresMessageRepository.js
 * -----------------------------------------------------------------------
 * Implementación concreta de IMessageRepository. findLast(N) trae los N
 * más recientes ordenados DESC (barato con el índice idx_messages_created_at)
 * y luego se invierte en memoria para devolverlos en orden cronológico
 * ascendente, que es como un chat espera renderizar su historial.
 * -----------------------------------------------------------------------
 */
const IMessageRepository = require('../../domain/repositories/IMessageRepository');
const { Message } = require('../../domain/entities/Message');
const { query } = require('../database/pool');

function rowToMessage(row) {
  if (!row) return null;
  return new Message({
    id: row.id,
    userId: row.user_id,
    username: row.username,
    text: row.text,
    createdAt: row.created_at,
  });
}

class PostgresMessageRepository extends IMessageRepository {
  async create(message) {
    const result = await query(
      `INSERT INTO messages (user_id, username, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [message.userId, message.username, message.text]
    );
    return rowToMessage(result.rows[0]);
  }

  async findLast(limit = 10) {
    const result = await query(
      `SELECT * FROM messages ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows.map(rowToMessage).reverse(); // cronológico ascendente
  }
}

module.exports = PostgresMessageRepository;
