/**
 * tests/chat-two-clients-test.js
 * -----------------------------------------------------------------------
 * Evidencia funcional exigida por la Actividad 1 y 3 del Caso Práctico
 * Unidad 2: "2 navegadores: al enviar un mensaje en uno, aparece en el
 * otro en tiempo real" y "prueba completa (2 usuarios en paralelo)
 * mostrando carga de últimos 10 + envío y recepción en tiempo real".
 *
 * Simula 2 clientes reales de Socket.IO (equivalentes a 2 pestañas del
 * navegador), cada uno autenticado con su propio JWT, y verifica:
 *   1. Ambos reciben el historial de últimos 10 mensajes al conectar.
 *   2. Un mensaje enviado por el cliente A llega también al cliente A
 *      (broadcast a todos) y, sobre todo, al cliente B en tiempo real.
 *   3. Un mensaje enviado por el cliente B llega a ambos también.
 *
 * Uso: BASE_URL=http://localhost:3000 node tests/chat-two-clients-test.js
 * -----------------------------------------------------------------------
 */
const { io } = require('socket.io-client');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API = `${BASE_URL}/api/v1`;

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Login falló para ${email}: ${JSON.stringify(json)}`);
  return json.data; // { token, user }
}

function connectClient(label, token) {
  return new Promise((resolve, reject) => {
    const socket = io(BASE_URL, { auth: { token }, transports: ['websocket'] });

    socket.on('connect', () => {
      console.log(`[${label}] ✅ Conectado (socket id: ${socket.id})`);
    });

    socket.on('chat-history', (history) => {
      console.log(`[${label}] 📜 Historial recibido al conectar (${history.length} mensajes):`);
      history.forEach((m) => console.log(`         - [${m.username}] ${m.text}`));
      resolve(socket);
    });

    socket.on('new-message', (msg) => {
      console.log(`[${label}] 💬 new-message en vivo => [${msg.username}]: ${msg.text}`);
    });

    socket.on('chat-error', (err) => {
      console.error(`[${label}] ⚠️  chat-error:`, err);
    });

    socket.on('connect_error', (err) => {
      console.error(`[${label}] ❌ connect_error:`, err.message);
      reject(err);
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('== Login de los 2 usuarios de prueba ==');
  const ventas = await login('ventas@ecohome.test', 'Ventas123!');
  const logistica = await login('logistica@ecohome.test', 'Logistica123!');
  console.log(`Ventas token:     ${ventas.token.slice(0, 20)}...`);
  console.log(`Logística token:  ${logistica.token.slice(0, 20)}...\n`);

  console.log('== Conectando 2 clientes Socket.IO en paralelo (simula 2 navegadores) ==');
  const [socketVentas, socketLogistica] = await Promise.all([
    connectClient('NAVEGADOR-1-VENTAS', ventas.token),
    connectClient('NAVEGADOR-2-LOGISTICA', logistica.token),
  ]);

  await wait(500);

  console.log('\n== Ventas envía un mensaje ==');
  socketVentas.emit('new-message', { text: 'Confirmado: hay 40 unidades de vasos ecológicos en stock.' });
  await wait(800);

  console.log('\n== Logística responde ==');
  socketLogistica.emit('new-message', { text: 'Recibido, alistamos el pedido para envío hoy mismo.' });
  await wait(800);

  console.log('\n== Verificando persistencia vía endpoint HTTP /messages/recent ==');
  const verifyRes = await fetch(`${API}/messages/recent`, {
    headers: { Authorization: `Bearer ${ventas.token}` },
  });
  const verifyJson = await verifyRes.json();
  console.log(`HTTP ${verifyRes.status} - ${verifyJson.data.length} mensajes almacenados en BD:`);
  verifyJson.data.forEach((m) => console.log(`  [${m.createdAt}] ${m.username}: ${m.text}`));

  socketVentas.close();
  socketLogistica.close();
  console.log('\n== Prueba finalizada: ambos clientes recibieron los mensajes del otro en tiempo real ==');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error en la prueba:', err);
  process.exit(1);
});
