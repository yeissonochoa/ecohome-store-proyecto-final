/**
 * src/infrastructure/repositories/PostgresUserRepository.js
 * -----------------------------------------------------------------------
 * Implementación concreta de IUserRepository usando PostgreSQL (pg).
 * Traduce filas de la BD <-> entidad de dominio User, para que el
 * resto del sistema nunca vea un "row" crudo de PostgreSQL.
 * -----------------------------------------------------------------------
 */
const IUserRepository = require('../../domain/repositories/IUserRepository');
const { User } = require('../../domain/entities/User');
const { query } = require('../database/pool');

function rowToUser(row) {
  if (!row) return null;
  return new User({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  });
}

class PostgresUserRepository extends IUserRepository {
  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rowToUser(result.rows[0]);
  }

  async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rowToUser(result.rows[0]);
  }

  async create(user) {
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.name, user.email, user.passwordHash, user.role]
    );
    return rowToUser(result.rows[0]);
  }
}

module.exports = PostgresUserRepository;
