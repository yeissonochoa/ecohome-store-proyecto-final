import { useAuth } from '../context/AuthContext';

/**
 * src/components/AppHeader.jsx
 * -----------------------------------------------------------------------
 * Header compartido entre Chat y Catalog: marca, pestañas de navegación
 * (Chat / Catálogo), estado de conexión (opcional, solo aplica al chat)
 * y usuario actual con botón de salir.
 * -----------------------------------------------------------------------
 */
export default function AppHeader({ view, onChangeView, connected }) {
  const { session, logout } = useAuth();
  const currentUsername = session?.user?.email;

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <span className="chat-brand">EcoHome Connect</span>
        <nav className="view-tabs">
          <button
            type="button"
            className={`view-tab ${view === 'chat' ? 'active' : ''}`}
            onClick={() => onChangeView('chat')}
          >
            Chat
          </button>
          <button
            type="button"
            className={`view-tab ${view === 'catalog' ? 'active' : ''}`}
            onClick={() => onChangeView('catalog')}
          >
            Catálogo
          </button>
        </nav>
      </div>
      <div className="chat-header-right">
        {view === 'chat' && (
          <div className="connection-status">
            <span className={`status-dot ${connected ? 'online' : ''}`} />
            {connected ? 'En vivo' : 'Reconectando…'}
          </div>
        )}
        <span className="current-user">{currentUsername}</span>
        <button className="btn-logout" onClick={logout} type="button">
          Salir
        </button>
      </div>
    </header>
  );
}
