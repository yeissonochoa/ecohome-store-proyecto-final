import { useEffect, useRef, useState } from 'react';
import { createChatSocket } from '../api/socketClient';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';

/**
 * src/pages/Chat.jsx
 * -----------------------------------------------------------------------
 * Pantalla de chat funcional exigida por la Actividad 3 de la Unidad 2:
 *   - Conexión a Socket.IO enviando el token (api/socketClient.js).
 *   - Al conectar, recibe 'chat-history' con los últimos 10 mensajes
 *     y los renderiza.
 *   - Escucha 'new-message' y agrega cada mensaje entrante en vivo.
 *   - Input + botón "Enviar" que emite 'new-message'.
 *
 * A partir de la Unidad 3 recibe `view`/`onChangeView` para compartir
 * el header de navegación con la pantalla de Catálogo.
 * -----------------------------------------------------------------------
 */
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export default function Chat({ view, onChangeView }) {
  const { session, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const bodyRef = useRef(null);

  const currentUsername = session?.user?.email;

  useEffect(() => {
    const socket = createChatSocket(session.token);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('chat-history', (history) => {
      setMessages(history);
    });

    // Alias: algunos backends de referencia emiten el historial bajo el
    // nombre de evento 'messages' en vez de 'chat-history'.
    socket.on('messages', (history) => {
      setMessages(history);
    });

    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('chat-error', (err) => {
      setError(err?.message || 'Ocurrió un error en el chat.');
      setTimeout(() => setError(''), 4000);
    });

    socket.on('connect_error', (err) => {
      setError(`No se pudo conectar: ${err.message}`);
      if (err.message?.startsWith('AUTH_')) {
        logout();
      }
    });

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit('new-message', { text });
    setDraft('');
  }

  return (
    <div className="chat-screen">
      <AppHeader view={view} onChangeView={onChangeView} connected={connected} />

      <div className="chat-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            Todavía no hay mensajes en este canal. Escribe el primero para
            coordinar con Ventas, Logística o Soporte.
          </div>
        ) : (
          <>
            <div className="history-divider">Últimos mensajes</div>
            {messages.map((m) => {
              const isOwn = m.username === currentUsername;
              return (
                <div key={m.id ?? `${m.username}-${m.createdAt}`} className={`message-row ${isOwn ? 'own' : 'other'}`}>
                  <span className="message-meta">
                    {isOwn ? 'Tú' : m.username} · {formatTime(m.createdAt)}
                  </span>
                  <div className="message-bubble">{m.text}</div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {error && <div className="chat-error-banner">{error}</div>}

      <form className="chat-composer" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Escribe un mensaje para el equipo…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
        />
        <button className="btn-send" type="submit" disabled={!draft.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
