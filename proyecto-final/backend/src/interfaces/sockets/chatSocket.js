/**
 * src/interfaces/sockets/chatSocket.js
 * -----------------------------------------------------------------------
 * Adaptador de tiempo real (equivalente WebSocket de un controller HTTP).
 * Responsabilidades, en línea con los entregables de la Actividad 1 y 2
 * del Caso Práctico Unidad 2:
 *
 *   1. Autenticación real en el handshake: ningún socket queda
 *      conectado sin un JWT válido (mismo TokenService que ya protege
 *      la API REST, así que un usuario con token expirado no puede
 *      abrir el chat).
 *   2. Al conectar, envía el historial de los últimos 10 mensajes.
 *   3. Escucha 'new-message', lo PERSISTE primero y solo después lo
 *      reenvía (broadcast) a todos los clientes conectados con
 *      io.emit(...).
 *   4. Loguea conexión/desconexión con el username resuelto del token.
 *
 * Composition root manual de esta feature: instancia el repositorio
 * concreto una sola vez e inyecta los casos de uso, igual que hacen
 * los controladores HTTP (AuthController, ProductController).
 * -----------------------------------------------------------------------
 */
const TokenService = require('../../infrastructure/security/TokenService');
const PostgresMessageRepository = require('../../infrastructure/repositories/PostgresMessageRepository');
const SendMessageUseCase = require('../../use-cases/chat/SendMessageUseCase');
const GetRecentMessagesUseCase = require('../../use-cases/chat/GetRecentMessagesUseCase');

const HISTORY_SIZE = 10;

const messageRepository = new PostgresMessageRepository();
const sendMessageUseCase = new SendMessageUseCase(messageRepository);
const getRecentMessagesUseCase = new GetRecentMessagesUseCase(messageRepository);

/**
 * Middleware de Socket.IO ejecutado durante el handshake, ANTES de que
 * la conexión se acepte. Si no hay token válido, rechaza la conexión
 * con next(new Error(...)) — el cliente nunca llega a 'connection'.
 */
function socketAuthMiddleware(socket, next) {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers?.authorization || '').replace('Bearer ', '');

  if (!token) {
    return next(new Error('AUTH_REQUIRED: token no proporcionado.'));
  }

  try {
    const payload = TokenService.verify(token);
    // eslint-disable-next-line no-param-reassign
    socket.user = { id: payload.id, username: payload.email, role: payload.role };
    return next();
  } catch (err) {
    return next(new Error('AUTH_INVALID: token inválido o expirado.'));
  }
}

/**
 * Registra toda la lógica del chat sobre una instancia de Socket.IO ya
 * creada (se le pasa `io` desde server.js, que es quien conoce el
 * servidor HTTP subyacente).
 * @param {import('socket.io').Server} io
 */
function registerChatSocket(io) {
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    const { username } = socket.user;
    // eslint-disable-next-line no-console
    console.log(`[socket] Usuario conectado: ${username} (socket ${socket.id})`);

    try {
      const history = await getRecentMessagesUseCase.execute(HISTORY_SIZE);
      // Se emite bajo dos nombres de evento por compatibilidad:
      //  - 'chat-history': nombre usado por los clientes React/Flutter
      //    entregados en este proyecto.
      //  - 'messages': nombre de ejemplo citado textualmente en el
      //    enunciado del Proyecto Final ("socket.emit('messages', [...])").
      // Mismo payload en ambos, así cualquier cliente que escuche uno u
      // otro nombre recibe el historial correctamente.
      socket.emit('chat-history', history);
      socket.emit('messages', history);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[socket] Error cargando historial:', err.message);
      socket.emit('chat-error', { message: 'No se pudo cargar el historial de mensajes.' });
    }

    socket.on('new-message', async (payload) => {
      try {
        const text = typeof payload === 'string' ? payload : payload?.text;
        const saved = await sendMessageUseCase.execute({
          userId: socket.user.id,
          username: socket.user.username,
          text,
        });
        // Broadcast a TODOS los clientes conectados, incluido el emisor,
        // tal como exige el enunciado ("reenvío del mensaje a todos los
        // clientes conectados con io.emit(...)").
        io.emit('new-message', saved);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[socket] Error procesando mensaje de ${username}:`, err.message);
        socket.emit('chat-error', { message: err.message || 'No se pudo enviar el mensaje.' });
      }
    });

    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log(`[socket] Usuario desconectado: ${username} (socket ${socket.id}) — ${reason}`);
    });
  });
}

module.exports = { registerChatSocket, socketAuthMiddleware };
