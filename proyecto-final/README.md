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
Copia la plantilla y ajusta tus credenciales de PostgreSQL:
```bash
cd backend
copy .env.example .env      # Windows (PowerShell)
# cp .env.example .env      # macOS/Linux
```
Contenido esperado:
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=ecohome_store
DB_SSL=false

JWT_SECRET=pon_aqui_una_clave_larga_y_aleatoria
JWT_EXPIRES_IN=1h

BCRYPT_SALT_ROUNDS=10

# Origen permitido para CORS y para el handshake de Socket.IO
CORS_ORIGIN=http://localhost:5173
```

### Frontend web (`/web-react/.env`)
```bash
cd web-react
copy .env.example .env
```
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

### App móvil (`/mobile-flutter/lib/config/env.dart`)
No usa `.env` (Flutter resuelve la URL según la plataforma en tiempo de
ejecución). Solo edita el puerto si tu backend no corre en 3000:
```dart
static const int backendPort = 3000;
```
Y, si vas a probar en un **celular físico** (no emulador/simulador),
define tu IP LAN:
```dart
static const String? manualHostOverride = '192.168.1.50';
```

---

## 2. Cómo correr el Backend

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
🌱 EcoHome Store backend escuchando en http://localhost:3000
   Socket.IO (chat en tiempo real) activo en el mismo puerto.
```

Verifica:
```bash
curl http://localhost:3000/api/v1/health
```

## 3. Cómo correr el Frontend Web (React)

```bash
cd web-react
npm install
npm run dev
```
Abre `http://localhost:5173`.

## 4. Cómo correr la App Móvil (Flutter)

```bash
cd mobile-flutter
flutter create .        # genera android/ ios/ web/ (solo la primera vez)
flutter pub get
flutter run              # con un emulador/dispositivo ya conectado
```
Ver `mobile-flutter/README.md` para la guía completa de instalación de
Flutter y Android Studio, y solución de problemas comunes.

Para generar el **APK** de evidencia (ver Módulo C del enunciado):
```bash
flutter build apk --debug
```
El archivo queda en `build/app/outputs/flutter-apk/app-debug.apk`.

---

## 5. Credenciales de prueba

No se incluyen usuarios precargados en la base de datos (por seguridad,
las contraseñas nunca se siembran en texto plano en un script). Créalos
tú mismo con estos dos comandos, una sola vez:

**Admin** (puede crear/editar/eliminar productos):
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Arturo","email":"arturo@ecohome.test","password":"Arturo123!","role":"admin"}'
```

**Cliente** (solo consulta el catálogo y usa el chat):
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Demo","email":"cliente@ecohome.test","password":"Cliente123!"}'
```

Luego inicia sesión con cualquiera de los dos desde React, Flutter, o:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arturo@ecohome.test","password":"Arturo123!"}'
```

---

## 6. Rutas HTTP

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
| POST | `/api/v1/products` | JWT + admin | Crea producto, asociado al usuario del token |
| PUT/PATCH | `/api/v1/products/:id` | JWT + admin | Actualiza producto |
| DELETE | `/api/v1/products/:id` | JWT + admin | Elimina producto |

### Usuarios
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/users/me/stats` | JWT | `{ name, productsCreated, label: "Nombre (N)" }` |

### Mensajes (verificación de persistencia)
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/messages/recent` | JWT | Últimos N mensajes guardados en BD |

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

---

## 7. Rutas y eventos de Socket.IO

**Conexión** (namespace por defecto, mismo puerto que la API REST):
```
ws://localhost:3000
```
El **handshake exige un JWT válido**, enviado por el cliente como:
```js
io(SOCKET_URL, { auth: { token: "<jwt>" } })
```
Si falta o es inválido, el servidor rechaza la conexión con
`connect_error` (`AUTH_REQUIRED` o `AUTH_INVALID`) — nunca llega a
`connection`.

| Evento | Dirección | Payload | Descripción |
|---|---|---|---|
| `chat-history` | servidor → cliente | `Message[]` | Últimos 10 mensajes, emitido justo al conectar |
| `messages` | servidor → cliente | `Message[]` | Alias de `chat-history` (mismo payload), por compatibilidad con distintos nombres de evento |
| `new-message` | cliente → servidor | `{ text: string }` | El cliente envía un mensaje nuevo |
| `new-message` | servidor → todos los clientes | `Message` | Broadcast del mensaje ya persistido en BD (`io.emit`) |
| `chat-error` | servidor → cliente | `{ message: string }` | Error de validación o de servidor |
| `disconnect` | — | — | Logueado en el servidor con el username resuelto del JWT |

Formato de `Message`:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "username": "arturo@ecohome.test",
  "text": "Confirmado: hay 40 unidades en stock.",
  "createdAt": "2026-08-27T00:56:00.000Z"
}
```

---

## 8. Reglas de integración cumplidas

- ✅ **Un solo backend** para web y móvil — ni un endpoint duplicado; React y Flutter llaman literalmente las mismas rutas HTTP y el mismo servidor Socket.IO.
- ✅ **Misma autenticación JWT** para ambos clientes (mismo `TokenService`, mismo `authJWT`/`socketAuthMiddleware`).
- ✅ **Persistencia total**: productos y mensajes viven en PostgreSQL, no en memoria — sobreviven reinicios del proceso Node.js (verificado explícitamente, ver informes de Unidad 1 y 2).
- ✅ **Códigos HTTP correctos**: 200/201/400/401/403/404/409 según corresponda, con manejo centralizado de errores (`errorHandler`).
- ✅ **Seguridad**: contraseñas hasheadas con bcrypt (nunca texto plano), rutas de escritura protegidas con JWT + RBAC.

## 9. Evidencias incluidas

- `db/*.sql` — scripts de creación y migraciones.
- `backend/tests/curl-collection.sh` — colección de pruebas cURL end-to-end (signup → login → CRUD, con casos de error).
- `backend/tests/chat-two-clients-test.js` — prueba de 2 clientes de Socket.IO en paralelo (historial + tiempo real).
- `backend/tests/evidencias/*.txt` — logs de las pruebas ya ejecutadas (persistencia, trazabilidad, contador, auth de chat).
- `mobile-flutter/README.md` — guía paso a paso de instalación de Flutter/Android Studio y solución de problemas comunes.

## 10. Documentación técnica adicional

Los informes técnicos detallados de cada unidad (arquitectura, decisiones
de diseño, evidencias completas) están en los documentos Word entregados
junto con este repositorio:
- Informe Técnico Unidad 1 — Backend RESTful base.
- Informe Técnico Unidad 2 — Chat en tiempo real.
- Informe Técnico Unidad 3 — App móvil y trazabilidad.
