import { useCallback, useEffect, useState } from 'react';
import { getProducts, createProduct, getMyStats } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';

/**
 * src/pages/Catalog.jsx
 * -----------------------------------------------------------------------
 * Pantalla de catálogo exigida por la Actividad 3 (Unidad 3):
 *   - Lista productos mostrando el creador (creatorUsername).
 *   - Muestra el usuario autenticado con su contador "Nombre (N)".
 *   - Si el usuario es admin, permite crear productos desde un
 *     formulario simple; al crear uno, el contador se actualiza de
 *     inmediato en pantalla (sin recargar la página).
 * -----------------------------------------------------------------------
 */
function formatDate(iso) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function Catalog({ view, onChangeView }) {
  const { session } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [productList, myStats] = await Promise.all([getProducts(), getMyStats(session.token)]);
      setProducts(productList);
      setStats(myStats);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  }, [session.token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createProduct(session.token, {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock) || 0,
      });
      setForm({ name: '', price: '', stock: '' });
      // Recarga catálogo + stats: es lo que hace que el contador pase de
      // "Arturo (N)" a "Arturo (N+1)" de inmediato en pantalla.
      await loadAll();
    } catch (err) {
      setError(err.message || 'No se pudo crear el producto.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="catalog-screen">
      <AppHeader view={view} onChangeView={onChangeView} />

      {stats && (
        <div className="catalog-user-banner">
          <span className="catalog-user-label">{stats.label}</span>
          <span className="catalog-user-sub">productos creados por ti</span>
        </div>
      )}

      {error && <div className="form-error" style={{ margin: '0 24px 12px' }}>{error}</div>}

      {isAdmin && (
        <form className="catalog-create-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
          <button className="btn-send" type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear producto'}
          </button>
        </form>
      )}

      <div className="catalog-list">
        {loading ? (
          <div className="chat-empty">Cargando catálogo…</div>
        ) : products.length === 0 ? (
          <div className="chat-empty">Todavía no hay productos en el catálogo.</div>
        ) : (
          products.map((p) => (
            <div className="catalog-card" key={p.id}>
              <div className="catalog-card-top">
                <span className="catalog-card-name">{p.name}</span>
                <span className="catalog-card-price">${p.price.toFixed(2)}</span>
              </div>
              <div className="catalog-card-meta">
                <span>Stock: {p.stock}</span>
                <span>{p.isActive ? 'Disponible' : 'Agotado'}</span>
              </div>
              <div className="catalog-card-creator">
                Creado por <strong>{p.creatorUsername || 'desconocido'}</strong> · {formatDate(p.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
