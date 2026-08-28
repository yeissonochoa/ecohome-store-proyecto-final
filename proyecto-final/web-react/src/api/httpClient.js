/**
 * src/api/httpClient.js
 * -----------------------------------------------------------------------
 * Cliente delgado sobre fetch para hablar con la API REST del backend
 * (login). El chat en sí viaja por Socket.IO (ver api/socketClient.js);
 * este módulo solo se usa para autenticación.
 * -----------------------------------------------------------------------
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.error?.message || `Error ${res.status}`;
    throw new Error(message);
  }
  return json.data;
}

export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function signup(name, email, password) {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

/** Catálogo — público, no requiere token. */
export function getProducts() {
  return request('/products');
}

/**
 * Crea un producto. Requiere rol admin (el backend valida el rol vía el
 * token; el frontend simplemente envía el token que tenga).
 */
export function createProduct(token, { name, price, stock }) {
  return request('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, price, stock }),
  });
}

/**
 * Estadísticas del usuario autenticado: { name, productsCreated, label }.
 * `label` ya viene formateado como "Nombre (N)" (Actividad 3).
 */
export function getMyStats(token) {
  return request('/users/me/stats', { headers: { Authorization: `Bearer ${token}` } });
}
