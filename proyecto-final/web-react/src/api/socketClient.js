/**
 * src/api/socketClient.js
 * -----------------------------------------------------------------------
 * Crea la conexión de Socket.IO enviando el JWT en `auth.token`, que es
 * lo que el middleware socketAuthMiddleware del backend valida durante
 * el handshake (ver src/interfaces/sockets/chatSocket.js).
 * -----------------------------------------------------------------------
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/** @param {string} token JWT obtenido en /auth/login */
export function createChatSocket(token) {
  return io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });
}
