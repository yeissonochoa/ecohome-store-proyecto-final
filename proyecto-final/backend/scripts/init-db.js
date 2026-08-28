/**
 * scripts/init-db.js
 * -----------------------------------------------------------------------
 * Ejecuta database/schema.sql contra la base configurada en .env.
 * Uso: npm run db:init
 * -----------------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/infrastructure/database/pool');
const env = require('../src/config/env');

async function main() {
  console.log('[db:init] Configuración de conexión utilizada:');
  console.log(`           host=${env.db.host} port=${env.db.port} user=${env.db.user} database=${env.db.database}`);

  console.log('[db:init] Verificando conexión a PostgreSQL...');
  await pool.query('SELECT 1');
  console.log('[db:init] Conexión OK.');

  const sqlPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log('[db:init] Ejecutando schema.sql...');
  await pool.query(sql);
  console.log('[db:init] Tablas creadas/verificadas correctamente.');
  await pool.end();
}

main().catch((err) => {
  console.error('');
  console.error('=========================================================');
  console.error('[db:init] ERROR ejecutando schema.sql');
  console.error('=========================================================');
  console.error('Mensaje:  ', err.message || '(sin mensaje)');
  console.error('Código:   ', err.code || '(sin código)');
  console.error('Detalle:  ', err.detail || '(sin detalle adicional)');
  console.error('Hint:     ', err.hint || '(sin sugerencia)');
  console.error('---------------------------------------------------------');
  console.error('Causas más comunes:');
  console.error('  - La base de datos indicada en DB_NAME no existe todavía.');
  console.error('    Créala primero: CREATE DATABASE ecohome_store;');
  console.error('  - Usuario/contraseña incorrectos en tu .env (DB_USER/DB_PASS).');
  console.error('  - El servicio de PostgreSQL no está corriendo.');
  console.error('  - DB_HOST o DB_PORT en .env no coinciden con tu instalación.');
  console.error('=========================================================');
  process.exitCode = 1;
});

