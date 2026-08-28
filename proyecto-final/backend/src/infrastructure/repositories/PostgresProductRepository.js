/**
 * src/infrastructure/repositories/PostgresProductRepository.js
 * -----------------------------------------------------------------------
 * Implementación concreta de IProductRepository usando PostgreSQL.
 * Construye el UPDATE de forma dinámica para permitir actualizaciones
 * parciales (PATCH) sin sobreescribir campos no enviados.
 *
 * A partir de la Unidad 3, findAll/findById/create hacen un LEFT JOIN
 * contra users para traer el username del creador en la misma consulta
 * (evita el problema N+1 de resolverlo aparte por cada producto). Es
 * LEFT JOIN y no INNER JOIN a propósito: productos creados antes de la
 * migración, o cuyo creador fue eliminado, tienen created_by NULL y
 * deben seguir listándose (con creatorUsername = null), no desaparecer.
 * -----------------------------------------------------------------------
 */
const IProductRepository = require('../../domain/repositories/IProductRepository');
const { Product } = require('../../domain/entities/Product');
const { query } = require('../database/pool');

const SELECT_WITH_CREATOR = `
  SELECT p.*, u.name AS creator_name, u.email AS creator_email
  FROM products p
  LEFT JOIN users u ON u.id = p.created_by
`;

function rowToProduct(row) {
  if (!row) return null;
  return new Product({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    isActive: row.is_active,
    stock: row.stock,
    createdBy: row.created_by,
    // Se expone el email (identificador único de login) como
    // "creatorUsername" para ser consistente con lo que ya usan el chat
    // y el JWT (payload.email) como username visible.
    creatorUsername: row.creator_email || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

class PostgresProductRepository extends IProductRepository {
  async findAll() {
    const result = await query(`${SELECT_WITH_CREATOR} ORDER BY p.created_at DESC`);
    return result.rows.map(rowToProduct);
  }

  async findById(id) {
    const result = await query(`${SELECT_WITH_CREATOR} WHERE p.id = $1`, [id]);
    return rowToProduct(result.rows[0]);
  }

  async create(product) {
    const result = await query(
      `INSERT INTO products (name, price, is_active, stock, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product.name, product.price, product.isActive, product.stock, product.createdBy]
    );
    // Se re-consulta con el JOIN para devolver creatorUsername ya resuelto,
    // en vez de duplicar la lógica del JOIN en un segundo SQL a mano.
    return this.findById(result.rows[0].id);
  }

  async update(id, changes) {
    const fieldMap = {
      name: 'name',
      price: 'price',
      isActive: 'is_active',
      stock: 'stock',
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || !fieldMap[key]) return;
      setClauses.push(`${fieldMap[key]} = $${paramIndex}`);
      values.push(value);
      paramIndex += 1;
    });

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
    const result = await query(sql, values);
    if (result.rowCount === 0) return null;
    return this.findById(result.rows[0].id);
  }

  async delete(id) {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  /**
   * Cuenta cuántos productos ha creado un usuario (métrica "Nombre (N)"
   * exigida por la Actividad 3).
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async countByCreator(userId) {
    const result = await query('SELECT COUNT(*)::int AS count FROM products WHERE created_by = $1', [userId]);
    return result.rows[0].count;
  }
}

module.exports = PostgresProductRepository;
