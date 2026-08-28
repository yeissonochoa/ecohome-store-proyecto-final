# EcoHome Store — Proyecto de Aplicación (Entrega Final)

Sistema completo listo para demo/beta: autenticación unificada (JWT),
gestión de productos con trazabilidad y contador dinámico, y chat de
soporte en tiempo real — consumido por **dos clientes** (web en React y
app móvil en Flutter) contra **un único backend**, sin endpoints
duplicados.

## Estructura del repositorio

```
/backend          Express.js + PostgreSQL + JWT + Socket.IO (Clean Architecture)
/web-react        Frontend web (React + Vite)
/mobile-flutter   App móvil (Flutter — Android/iOS/Web)
/db               Scripts SQL / migraciones (schema + chat + trazabilidad)
```

---

## 1. Variables de entorno

### Backend (`/backend/.env`)
Copia la plantilla y ajusta si tu PostgreSQL local usa otro puerto/credenciales:
```bash
cd backend
copy .env.example .env      # Windows (PowerShell)
# cp .env.example .env      # macOS/Linux
```
Contenido usado en esta entrega:
```
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASS=postgres
DB_NAME=ecohome_store
DB_SSL=false

JWT_SECRET=change_this_super_secret_key_before_deploy
JWT_EXPIRES_IN=1h

BCRYPT_SALT_ROUNDS=10

# Origen permitido para CORS y para el handshake de Socket.IO
CORS_ORIGIN=http://localhost:5173
```
> ⚠️ `DB_PORT=5433` porque en este equipo PostgreSQL corre en ese puerto
> (probablemente hay otra instancia usando el 5432 por defecto). Si tu
> PostgreSQL usa el puerto estándar, cambia `DB_PORT` a `5432`.

### Frontend Web (`/web-react/.env`)
```bash
cd web-react
copy .env.example .env
```
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
```

### App Móvil (`/mobile-flutter/lib/config/env.dart`)
No usa archivo `.env`; la URL del backend se resuelve automáticamente
según la plataforma en tiempo de ejecución (emulador Android usa
`10.0.2.2`, el resto usa `localhost`). El puerto se define aquí:
```dart
static const int backendPort = 3001; // debe coincidir con PORT del backend
```
Si vas a probar en un **celular físico** (no emulador/simulador), define
tu IP LAN en el mismo archivo:
```dart
static const String? manualHostOverride = '192.168.1.50';
```

---

## 2. Cómo correr el proyecto

### Backend
```bash
cd backend
npm install
npm run db:create              # crea la base de datos si no existe
npm run db:init                # tablas users, products
npm run db:init:chat           # tabla messages
npm run db:init:traceability   # columna products.created_by
npm start
```
Debe mostrar:
```
🌱 EcoHome Store backend escuchando en http://localhost:3001
   Socket.IO (chat en tiempo real) activo en el mismo puerto.
```
Verifica:
```bash
curl http://localhost:3001/api/v1/health
```

### Frontend Web (React)
```bash
cd web-react
npm install
npm run dev
```
Abre `http://localhost:5173`.

### App Móvil (Flutter)
```bash
cd mobile-flutter
flutter create .        # solo la primera vez, genera android/ ios/ web/
flutter pub get
flutter run              # con un emulador/dispositivo ya conectado
```
Generar el APK de distribución (evidencia del Módulo C):
```bash
flutter build apk --debug
```
El archivo queda en `build/app/outputs/flutter-apk/app-debug.apk`.

**Importante:** el backend debe estar corriendo (`npm start`) *antes* de
abrir el frontend web o la app móvil, ya que ambos dependen de él para
login, catálogo y chat.

---

## 3. Credenciales de prueba

| Rol | Email | Password | Permisos |
|---|---|---|---|
| Admin | `santi@ecohome.test` | `Santi123!` | Crear/editar/eliminar productos, ver su contador de productos creados |
| Cliente | `cliente1@ecohome.test` | `Cliente123!` | Solo consulta el catálogo y usa el chat |

Usuarios adicionales usados en las pruebas del chat en tiempo real:
| Email | Password |
|---|---|
| `ventas@ecohome.test` | `Ventas123!` |
| `logistica@ecohome.test` | `Logistica123!` |

Si necesitas recrear cualquiera de estos usuarios (o crear uno nuevo):
```bash
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"santi","email":"snati@ecohome.test","password":"santi123!","role":"admin"}'
```
El campo `role` es opcional — si se omite, el usuario queda como `client`.

---

## 4. Rutas HTTP

### Autenticación
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | Pública | Registra usuario (`role`: `admin`/`client`) |
| POST | `/api/v1/auth/login` | Pública | Devuelve `{ token, user }` |

### Productos
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/products` | Pública | Lista productos, incluye `creatorUsername` |
| GET | `/api/v1/products/:id` | Pública | Detalle por id (404 si no existe) |
| POST | `/api/v1/products` | JWT + rol `admin` | Crea producto, asociado automáticamente al usuario del token |
| PUT/PATCH | `/api/v1/products/:id` | JWT + rol `admin` | Actualiza producto |
| DELETE | `/api/v1/products/:id` | JWT + rol `admin` | Elimina producto |

### Usuarios
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/users/me/stats` | JWT | Devuelve `{ name, productsCreated, label: "Nombre (N)" }` |

### Mensajes (verificación de persistencia)
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/messages/recent` | JWT | Últimos N mensajes guardados en base de datos |

### Salud del servicio
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | Pública | Verifica que el backend está en línea |

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

---

## 5. Rutas y eventos de Socket.IO

**Conexión** (mismo puerto que la API REST):
```
ws://localhost:3001
```

El **handshake exige un JWT válido**, enviado por el cliente como:
```js
io("http://localhost:3001", { auth: { token: "<jwt>" } })
```
Si el token falta o es inválido, el servidor rechaza la conexión con
`connect_error` (`AUTH_REQUIRED` o `AUTH_INVALID`) — el cliente nunca
llega al evento `connection`.

| Evento | Dirección | Payload | Descripción |
|---|---|---|---|
| `chat-history` | servidor → cliente | `Message[]` | Últimos 10 mensajes, emitido justo al conectar |
| `messages` | servidor → cliente | `Message[]` | Alias de `chat-history` (mismo payload) |
| `new-message` | cliente → servidor | `{ text: string }` | El cliente envía un mensaje nuevo |
| `new-message` | servidor → todos los clientes | `Message` | Broadcast del mensaje ya persistido en BD (`io.emit`) |
| `chat-error` | servidor → cliente | `{ message: string }` | Error de validación o de servidor |
| `disconnect` | — | — | Logueado en el servidor con el username resuelto del JWT |

Formato de `Message`:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "username": "santi@ecohome.test",
  "text": "Confirmado: hay 40 unidades en stock.",
  "createdAt": "2026-08-28T14:49:56.000Z"
}
```

---

## 6. Reglas de integración cumplidas

- ✅ **Un solo backend** para web y móvil — ningún endpoint duplicado; React y Flutter consumen literalmente las mismas rutas HTTP y el mismo servidor Socket.IO.
- ✅ **Misma autenticación JWT** para ambos clientes.
- ✅ **Persistencia total**: productos y mensajes viven en PostgreSQL, sobreviven reinicios del proceso Node.js (verificado).
- ✅ **Códigos HTTP correctos**: 200/201/400/401/403/404/409 según corresponda.
- ✅ **Seguridad**: contraseñas hasheadas con bcrypt (nunca texto plano), rutas de escritura protegidas con JWT + control de roles.

## 7. Evidencias incluidas en el repositorio

- `db/*.sql` — scripts de creación y migraciones.
- `backend/tests/curl-collection.sh` — colección de pruebas cURL end-to-end.
- `backend/tests/chat-two-clients-test.js` — prueba de 2 clientes de Socket.IO en paralelo (historial + tiempo real). Uso:
  ```bash
  BASE_URL=http://localhost:3001 node tests/chat-two-clients-test.js
  ```
- `backend/tests/evidencias/*.txt` — logs de pruebas ya ejecutadas (persistencia, trazabilidad, contador, autenticación del chat).
- `mobile-flutter/README.md` — guía de instalación de Flutter/Android Studio y solución de problemas comunes.
