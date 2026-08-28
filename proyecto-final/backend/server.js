/**
 * server.js
 * -----------------------------------------------------------------------
 * Punto de entrada del proceso. A partir de la Unidad 2, ya no solo
 * levanta Express: crea un servidor HTTP explícito (http.createServer)
 * para poder adjuntarle una instancia de Socket.IO sobre el MISMO
 * puerto, tal como exige el enunciado ("Inicialización del servidor
 * WebSocket (Socket.IO) junto al servidor HTTP").
 * -----------------------------------------------------------------------
 */
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const env = require('./src/config/env');
const { checkConnection } = require('./src/infrastructure/database/pool');
const { registerChatSocket } = require('./src/interfaces/sockets/chatSocket');

async function start() {
  try {
    const now = await checkConnection();
    // eslint-disable-next-line no-console
    console.log(`[db] Conexión a PostgreSQL verificada (${now}).`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] No se pudo conectar a PostgreSQL en el arranque:', err.message);
  }

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  registerChatSocket(io);

  httpServer.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`🌱 EcoHome Store backend escuchando en http://localhost:${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`   Entorno: ${env.nodeEnv}`);
    // eslint-disable-next-line no-console
    console.log(`   Socket.IO (chat en tiempo real) activo en el mismo puerto.`);
  });
}

start();
