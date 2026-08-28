import { useState } from 'react';
import { login as loginRequest } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';

/**
 * src/pages/Login.jsx
 * -----------------------------------------------------------------------
 * Formulario de login exigido por la Actividad 3. Al autenticarse
 * correctamente, guarda { token, user } vía AuthContext (localStorage)
 * y permite el acceso a la pantalla de chat (App.jsx cambia de vista
 * según haya o no sesión).
 * -----------------------------------------------------------------------
 */
export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest(email.trim(), password);
      login(data); // { token, user }
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">EcoHome Connect</span>
        </div>
        <span className="login-brand-sub">Chat interno · Ventas · Logística · Soporte</span>
        <p className="login-tagline" style={{ marginTop: 14 }}>
          Inicia sesión con tu cuenta de EcoHome Store para entrar al canal
          de coordinación en tiempo real del equipo.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Correo corporativo</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ecohome.test"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar al chat'}
          </button>
        </form>

        <p className="login-footer-note">
          ¿No tienes cuenta? Pídele a un administrador que te registre desde
          el backend (POST /api/v1/auth/signup).
        </p>
      </div>
    </div>
  );
}
