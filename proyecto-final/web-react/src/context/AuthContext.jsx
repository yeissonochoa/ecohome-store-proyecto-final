/**
 * src/context/AuthContext.jsx
 * -----------------------------------------------------------------------
 * Guarda { token, user } en localStorage tras el login, tal como exige
 * el enunciado ("guardar token (estado/localStorage) y permitir acceso
 * al chat"). Se expone vía Context para que cualquier pantalla (Chat)
 * pueda leer el token sin pasarlo por props manualmente.
 * -----------------------------------------------------------------------
 */
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'ecohome_chat_session';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const login = ({ token, user }) => setSession({ token, user });
  const logout = () => setSession(null);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
