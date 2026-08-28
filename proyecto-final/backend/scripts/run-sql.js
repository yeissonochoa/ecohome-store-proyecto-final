/**
 * scripts/run-sql.js
 * -----------------------------------------------------------------------
 * Ejecuta un archivo .sql arbitrario contra la base configurada en .env.
 * La ruta se resuelve desde la RAÍZ del proyecto (un nivel arriba de
 * /backend), porque en la entrega final /db es una carpeta hermana de
 * /backend, no una subcarpeta suya.
 * Uso: node scripts/run-sql.js db/migration_messages.sql
 * -----------------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/infrastructure/database/pool');
const env = require('../src/config/env');

async function main() {
  const relativePath = process.argv[2];
  if (!relativePath) {
    console.error('Uso: node scripts/run-sql.js <ruta/al/archivo.sql>');
    process.exitCode = 1;
    return;
  }

  const sqlPath = path.join(__dirname, '..', '..', relativePath);
  if (!fs.existsSync(sqlPath)) {
    console.error(`[run-sql] No se encontró el archivo: ${sqlPath}`);
    process.exitCode = 1;
    return;
  }

  console.log('[run-sql] Configuración de conexión utilizada:');
  console.log(`           host=${env.db.host} port=${env.db.port} user=${env.db.user} database=${env.db.database}`);

  console.log('[run-sql] Verificando conexión a PostgreSQL...');
  await pool.query('SELECT 1');
  console.log('[run-sql] Conexión OK.');

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`[run-sql] Ejecutando ${relativePath}...`);
  await pool.query(sql);
  console.log('[run-sql] Completado correctamente.');
  await pool.end();
}

main().catch((err) => {
  console.error('');
  console.error('=========================================================');
  console.error('[run-sql] ERROR ejecutando el script SQL');
  console.error('=========================================================');
  console.error('Mensaje:  ', err.message || '(sin mensaje)');
  console.error('Código:   ', err.code || '(sin código)');
  console.error('Detalle:  ', err.detail || '(sin detalle adicional)');
  console.error('Hint:     ', err.hint || '(sin sugerencia)');
  console.error('=========================================================');
  process.exitCode = 1;
});
