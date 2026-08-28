# EcoHome Store — Backend RESTful (Clean Architecture)

Backend "beta-ready" para EcoHome Store: persistencia en PostgreSQL, autenticación
JWT stateless y control de acceso basado en roles (RBAC), listo para consumo desde
clientes Web y Mobile.

## 1. Requisitos previos
- Node.js >= 18
- PostgreSQL >= 13 en ejecución (local o en contenedor)

## 2. Instalación

```bash
npm install
cp .env.example .env
# edita .env con tus credenciales reales de PostgreSQL y un JWT_SECRET fuerte
```

## 3. Inicializar la base de datos

Todo esto funciona sin necesidad de tener `psql` en el PATH (útil en Windows,
donde el instalador de PostgreSQL no lo agrega automáticamente):

```bash
npm run db:create      # crea la base de datos indicada en DB_NAME si no existe
npm run db:init        # crea las tablas users y products (schema.sql)
npm run db:init:chat   # crea la tabla messages del chat (Unidad 2)
```

Si algo falla, cada script imprime el mensaje de error completo de
PostgreSQL (código, mensaje, detalle) y una lista de causas comunes
(BD inexistente, credenciales incorrectas, servicio detenido, etc.).

Alternativa con `psql` si lo tienes instalado y en el PATH:
```bash
psql -U <usuario> -d <basededatos> -f database/schema.sql
psql -U <usuario> -d <basededatos> -f database/migration_messages.sql
```

## 4. Levantar el servidor

```bash
npm run dev     # con nodemon, recarga en caliente
# o
npm start       # producción
```

El servidor queda disponible en `http://localhost:3000/api/v1`.

## 5. Prueba de persistencia (Actividad 1)
1. Crea un producto autenticado como admin (`POST /products`).
2. Detén el servidor (Ctrl+C) y vuelve a iniciarlo (`npm start`).
3. Ejecuta `GET /products`: el producto creado sigue presente porque
   está persistido en PostgreSQL, no en memoria del proceso Node.

## 6. Endpoints

### Autenticación
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | Pública | Registra un usuario (`role`: `admin` o `client`, por defecto `client`) |
| POST | `/api/v1/auth/login` | Pública | Devuelve `{ token, user }` |

### Productos
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/products` | Pública | Lista todos los productos (incluye `creatorUsername`, Unidad 3) |
| GET | `/api/v1/products/:id` | Pública | Detalle por id (404 si no existe) |
| POST | `/api/v1/products` | JWT + rol `admin` | Crea producto asociado al usuario del token (400 si `name` vacío o `price` <= 0) |
| PUT/PATCH | `/api/v1/products/:id` | JWT + rol `admin` | Actualiza producto |
| DELETE | `/api/v1/products/:id` | JWT + rol `admin` | Elimina producto |

### Usuarios (Unidad 3)
| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/api/v1/users/me/stats` | JWT | Devuelve `{ name, productsCreated, label }`, con `label` en formato `"Nombre (N)"` |

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

## 7. Colección de pruebas (Actividad 2 y 3)
`tests/curl-collection.sh` ejecuta el flujo completo exigido en el enunciado:
`signup → login → usar token → CRUD`, incluyendo los casos de error
(sin token → 401, rol incorrecto → 403, price inválido → 400, id inexistente → 404).

```bash
chmod +x tests/curl-collection.sh
BASE_URL=http://localhost:3000/api/v1 bash tests/curl-collection.sh
```

## 8. Estructura del proyecto (Clean Architecture)

```
src/
├── domain/            # Entidades (User, Product) e interfaces de repositorio
├── use-cases/         # Lógica de negocio pura (Auth, Products)
├── infrastructure/    # PostgreSQL, bcrypt, JWT, middlewares, errores
├── interfaces/         # Controladores, rutas y validadores HTTP
├── config/             # Carga y validación de variables de entorno
└── app.js              # Configuración de Express
server.js               # Punto de entrada del proceso
database/schema.sql      # DDL de PostgreSQL
.env.example              # Plantilla de variables de entorno
tests/curl-collection.sh  # Colección de pruebas end-to-end
```

## 9. Regla de dependencias (por qué es "Clean")
`interfaces` → `use-cases` → `domain`
`infrastructure` implementa las interfaces definidas en `domain` (Repository
pattern) y es inyectada en los casos de uso desde los controladores
(composition root). El dominio y los casos de uso **no importan** Express,
`pg`, `bcrypt` ni `jsonwebtoken` directamente: solo dependen de abstracciones.
Esto permite, por ejemplo, sustituir PostgreSQL por otro motor o extraer
`products` a un microservicio sin reescribir la lógica de negocio.

## 11. Unidad 2 — Chat interno en tiempo real (Socket.IO)

### 11.1 Backend del chat
- Migración: `database/migration_messages.sql` (ejecutar después de `schema.sql`).
- Socket.IO corre sobre el **mismo servidor HTTP y el mismo puerto** que la API REST (`server.js`).
- Todo socket debe conectarse con un JWT válido en `auth.token` (mismo token que devuelve `/auth/login`). Sin token, o con token inválido/expirado, la conexión se rechaza en el handshake.

```bash
npm run db:init:chat
npm start
```

Eventos del socket:
| Evento | Dirección | Descripción |
|---|---|---|
| `chat-history` | servidor → cliente | Se emite justo al conectar, con los últimos 10 mensajes |
| `new-message` | cliente → servidor | El cliente envía `{ text }` |
| `new-message` | servidor → todos los clientes | Broadcast del mensaje ya persistido en BD |
| `chat-error` | servidor → cliente | Error de validación o de servidor |

Endpoint HTTP adicional de verificación (evidencia de persistencia sin depender del chat en vivo):
```
GET /api/v1/messages/recent?limit=10   (requiere Authorization: Bearer <token>)
```

### 11.2 Prueba automatizada de 2 clientes en paralelo
```bash
node tests/chat-two-clients-test.js
```
Simula 2 navegadores (2 conexiones Socket.IO independientes, cada una con su propio usuario/token) y verifica que un mensaje enviado por uno llega en tiempo real al otro, además de comprobar la persistencia vía el endpoint HTTP.

### 11.3 Frontend React

```bash
cd frontend
npm install
cp .env.example .env   # ajusta las URLs si tu backend no corre en localhost:3000
npm run dev
```

Abre `http://localhost:5173` en **dos pestañas o navegadores distintos**, inicia sesión con dos usuarios diferentes (crea el segundo con `POST /api/v1/auth/signup` si hace falta) y envía mensajes desde cada una: deben aparecer en tiempo real en ambas pantallas, junto con el historial de los últimos 10 mensajes al entrar.

## 12. Notas de seguridad para producción

- El `role` en `/auth/signup` se aceptó como campo del enunciado para
  simplificar las pruebas del caso práctico. En un entorno real, la creación
  de usuarios `admin` **no** debería quedar expuesta en el signup público;
  debería hacerse vía invitación, semilla controlada o un endpoint protegido
  a su vez por un admin existente.
- Usa un `JWT_SECRET` largo y aleatorio (≥ 32 bytes) y rota periódicamente.
- Considera `httpOnly` cookies o almacenamiento seguro en el cliente móvil
  en vez de `localStorage` para el token.
- El chat es un broadcast global de un único canal (según el alcance del
  enunciado). Para producción con canales por equipo (Ventas/Logística/
  Soporte) o mensajes privados, se recomienda usar Socket.IO Rooms en vez
  de `io.emit` a todos los clientes.
- `CORS_ORIGIN` en `.env` debe restringirse al dominio real del frontend
  en producción (nunca `*`).

## 13. Unidad 3 — App móvil Flutter y trazabilidad de productos

### 13.1 Trazabilidad (Actividad 2)
Migración adicional, después de `schema.sql` y `migration_messages.sql`:
```bash
npm run db:init:traceability
```
Agrega `products.created_by` (FK a `users.id`). A partir de esta unidad,
`POST /products` toma el usuario desde el JWT (`req.user.id`) y lo
guarda como creador; `GET /products` y `GET /products/:id` devuelven
`creatorUsername` resuelto vía `LEFT JOIN` con `users`.

### 13.2 Contador "Nombre (N)" (Actividad 3)
`GET /api/v1/users/me/stats` devuelve cuántos productos ha creado el
usuario autenticado, en un campo `label` ya formateado (`"Arturo (3)"`),
para que React y Flutter lo muestren sin recalcularlo cada uno por su
cuenta.

### 13.3 Frontend React — pantalla de Catálogo
`frontend/src/pages/Catalog.jsx` (nueva) muestra el listado con
creador, el contador del usuario actual, y —si es admin— un formulario
para crear productos que refresca el contador de inmediato. Navegación
por pestañas "Chat / Catálogo" en el header (`AppHeader.jsx`).

### 13.4 App móvil Flutter (Actividad 1)
Ver `mobile_app/README.md` para la guía completa de instalación de
Flutter, emulador de Android y ejecución. Resumen rápido:
```bash
cd mobile_app
flutter create .
flutter pub get
flutter run
```
La app reutiliza los mismos endpoints (`/auth/login`, `/products`,
`/users/me/stats`) y el mismo Socket.IO del chat, con el mismo JWT que
usa React — sin endpoints paralelos, tal como exige el enunciado.
