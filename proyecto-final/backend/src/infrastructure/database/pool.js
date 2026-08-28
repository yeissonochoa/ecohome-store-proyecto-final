/**
 * src/infrastructure/database/pool.js
 * -----------------------------------------------------------------------
 * Módulo de conexión a PostgreSQL basado en `pg.Pool`.
 *
 * Por qué un Pool y no una conexión única:
 *  - Reutiliza conexiones TCP entre requests (mucho más barato que abrir
 *    una conexión por petición).
 *  - `pg.Pool` ya gestiona colas y timeouts de adquisición internamente.
 *
 * Manejo de reconexión:
 *  - El evento 'error' del pool captura fallos en clientes *inactivos*
 *    (p. ej. la BD cae mientras el cliente esperaba en el pool). Sin este
 *    listener, Node.js terminaría el proceso con una excepción no
 *    capturada. Aquí solo se loguea: el pool crea automáticamente un
 *    nuevo cliente en la siguiente consulta.
 *  - `query()` reintenta una vez ante errores transitorios de conexión
 *    (ECONNREFUSED / ETIMEDOUT), útil en arranques donde la BD todavía
 *    no está lista (contenedores, orquestadores).
 * -----------------------------------------------------------------------
 */
const { Pool } = require('pg');
const env = require('../../config/env');

const poolConfig = env.db.connectionString
  ? { connectionString: env.db.connectionString, ssl: env.db.ssl ? { rejectUnauthorized: false } : false }
  : {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10, // máximo de conexiones concurrentes en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[db] Error inesperado en cliente inactivo del pool:', err.message);
});

const TRANSIENT_ERROR_CODES = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND']);

/**
 * Ejecuta una consulta parametrizada contra el pool, con un reintento
 * ante errores transitorios de red/conexión.
 * @param {string} text
 * @param {Array<any>} [params]
 */
async function query(text, params = []) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    if (TRANSIENT_ERROR_CODES.has(err.code)) {
      // eslint-disable-next-line no-console
      console.warn(`[db] Error transitorio (${err.code}), reintentando una vez...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return pool.query(text, params);
    }
    throw err;
  }
}

/** Verifica conectividad al arrancar la aplicación (fail fast, con log claro). */
async function checkConnection() {
  const result = await query('SELECT NOW() AS now');
  return result.rows[0].now;
}

module.exports = { pool, query, checkConnection };
