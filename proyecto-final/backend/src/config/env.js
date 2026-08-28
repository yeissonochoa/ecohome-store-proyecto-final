/**
 * src/config/env.js
 * -----------------------------------------------------------------------
 * Punto único de carga de variables de entorno (dotenv) y validación
 * temprana ("fail fast"): si falta una variable crítica, el proceso
 * termina inmediatamente en el arranque en lugar de fallar más tarde
 * de forma silenciosa en tiempo de ejecución.
 * -----------------------------------------------------------------------
 */
require('dotenv').config();

const REQUIRED_VARS = ['JWT_SECRET'];

function assertRequiredVars() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[config] Faltan variables de entorno obligatorias: ${missing.join(', ')}. ` +
        'Revisa tu archivo .env (usa .env.example como referencia).'
    );
    process.exit(1);
  }
}

assertRequiredVars();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  db: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'ecohome_store',
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  },

  // Orígenes permitidos para CORS (API REST) y para el handshake de
  // Socket.IO (el frontend React del chat corre en un puerto distinto).
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = env;
