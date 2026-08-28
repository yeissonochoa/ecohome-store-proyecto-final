/**
 * scripts/create-db.js
 * -----------------------------------------------------------------------
 * Crea la base de datos indicada en DB_NAME (.env) si todavía no existe.
 * Se conecta a la base "postgres" (que siempre existe en toda instalación
 * de PostgreSQL) para poder ejecutar CREATE DATABASE, ya que ese comando
 * no puede correr contra una base que aún no existe.
 *
 * Uso: node scripts/create-db.js
 * -----------------------------------------------------------------------
 */
const { Pool } = require('pg');
const env = require('../src/config/env');

async function main() {
  const targetDb = env.db.database;

  console.log('[create-db] Configuración de conexión utilizada:');
  console.log(`             host=${env.db.host} port=${env.db.port} user=${env.db.user}`);
  console.log(`[create-db] Verificando si la base de datos "${targetDb}" existe...`);

  const adminPool = new Pool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: 'postgres', // base administrativa, siempre existe
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  });

  try {
    const exists = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);

    if (exists.rowCount > 0) {
      console.log(`[create-db] La base de datos "${targetDb}" ya existe. Nada que hacer.`);
    } else {
      // No se puede parametrizar el nombre en CREATE DATABASE; se valida
      // que solo contenga caracteres seguros antes de interpolarlo.
      if (!/^[a-zA-Z0-9_]+$/.test(targetDb)) {
        throw new Error(`DB_NAME contiene caracteres no permitidos: "${targetDb}"`);
      }
      await adminPool.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`[create-db] Base de datos "${targetDb}" creada correctamente.`);
    }
  } finally {
    await adminPool.end();
  }
}

main().catch((err) => {
  console.error('');
  console.error('=========================================================');
  console.error('[create-db] ERROR creando la base de datos');
  console.error('=========================================================');
  console.error('Mensaje:  ', err.message || '(sin mensaje)');
  console.error('Código:   ', err.code || '(sin código)');
  console.error('---------------------------------------------------------');
  console.error('Causas más comunes:');
  console.error('  - Usuario/contraseña incorrectos en tu .env (DB_USER/DB_PASS).');
  console.error('  - El servicio de PostgreSQL no está corriendo.');
  console.error('=========================================================');
  process.exitCode = 1;
});
