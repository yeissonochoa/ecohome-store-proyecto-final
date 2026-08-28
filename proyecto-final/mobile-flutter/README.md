# EcoHome Connect — App Móvil (Flutter)

App Flutter que reutiliza **exactamente el mismo backend** de EcoHome
Store (Express + PostgreSQL + Socket.IO) que ya consume el frontend
React: mismo login JWT, mismo catálogo de productos con trazabilidad
del creador, mismo chat en tiempo real. Ningún endpoint nuevo ni
paralelo — Caso Práctico Unidad 3, Actividad 1.

## 1. Qué vas a necesitar (una sola vez)

1. **Flutter SDK** — descárgalo desde https://docs.flutter.dev/get-started/install/windows
   Descomprime el zip en, por ejemplo, `C:\src\flutter` y agrega
   `C:\src\flutter\bin` a tu variable de entorno `PATH` (Panel de
   Control → Editar variables de entorno del sistema).
2. **Android Studio** (para el emulador de Android y las herramientas
   de compilación): https://developer.android.com/studio
   Durante la instalación, asegúrate de instalar también "Android
   Virtual Device" y el "Android SDK".
3. Verifica que todo quedó bien instalado:
   ```powershell
   flutter doctor
   ```
   Resuelve cualquier ❌ que te marque antes de continuar (lo más común
   es aceptar licencias de Android con `flutter doctor --android-licenses`).

## 2. Crear el emulador de Android (si no tienes uno)

En Android Studio: **More Actions → Virtual Device Manager → Create
Device** → elige cualquier teléfono (ej. Pixel 7) → descarga una imagen
de sistema reciente → Finish.

Luego, para iniciarlo desde la terminal:
```powershell
flutter emulators
flutter emulators --launch <nombre_del_emulador>
```
(o simplemente ábrelo desde el botón ▶ en el Virtual Device Manager).

## 3. Preparar el proyecto Flutter

Copia la carpeta `mobile_app` a tu proyecto (ya viene con `lib/` y
`pubspec.yaml` completos). Luego, dentro de esa carpeta:

```powershell
cd mobile_app
flutter create .
```

**¿Por qué `flutter create .`?** Este repositorio solo trae el código
Dart (`lib/`) y `pubspec.yaml`, que es lo único que no se puede generar
automáticamente. Los archivos de plataforma (`android/`, `ios/`,
`web/`, `windows/`, íconos, `Info.plist`, `build.gradle`, etc.) son
boilerplate específico de cada plataforma que Flutter genera por ti sin
sobreescribir tu código existente. Es un paso estándar al recibir un
proyecto Flutter sin esas carpetas.

```powershell
flutter pub get
```

## 4. Levanta el backend PRIMERO

En otra terminal, ve a la carpeta del backend (no de la app móvil):
```powershell
cd ..\ecohome-backend
npm start
```
Confirma que dice `escuchando en http://localhost:3001` (o el puerto
que tengas configurado — si usas otro puerto, ajusta `backendPort` en
`lib/config/env.dart`).

## 5. Corre la app Flutter

Con el emulador de Android ya abierto:
```powershell
flutter run
```
Si tienes varios dispositivos/targets disponibles (emulador, Chrome,
Windows), Flutter te preguntará cuál usar, o puedes ser explícito:
```powershell
flutter run -d emulator-5554   # Android (el id exacto sale de `flutter devices`)
flutter run -d chrome           # Flutter Web
flutter run -d windows          # App de escritorio Windows
```

### Sobre las URLs del backend según dónde corras la app
`lib/config/env.dart` ya resuelve esto automáticamente:
- **Emulador de Android** → usa `10.0.2.2` (la IP especial que Android
  reserva para referirse a tu PC desde dentro del emulador).
- **Chrome / Windows / iOS Simulator** → usa `localhost` directamente.
- **Celular físico real** conectado por USB o Wi-Fi → ninguna de las
  anteriores funciona. Debes editar `manualHostOverride` en
  `lib/config/env.dart` con la IP LAN de tu PC:
  ```powershell
  ipconfig
  ```
  busca "Dirección IPv4" de tu adaptador Wi-Fi (ej. `192.168.1.50`), y
  pon:
  ```dart
  static const String? manualHostOverride = '192.168.1.50';
  ```
  Además, tu backend debe escuchar en todas las interfaces, no solo en
  localhost (revisa que no tengas un firewall bloqueando el puerto 3001).

## 6. Flujo de prueba para la evidencia (Actividad 1)

1. **Login**: abre la app, inicia sesión con un usuario ya creado
   (o regístrate desde el mismo formulario, botón "¿No tienes cuenta?").
   👉 Evidencia: pantalla de login llena, y la pantalla de catálogo
   apareciendo justo después (confirma que el JWT se guardó y permitió
   el acceso).
2. **Catálogo**: la pestaña inferior "Catálogo" ya debe listar los
   productos existentes, cada uno con su creador. Si tu usuario es
   admin, crea un producto desde el formulario superior.
   👉 Evidencia: el contador "Nombre (N)" pasando a "Nombre (N+1)"
   justo después de crear el producto, sin recargar la app.
3. **Chat**: cambia a la pestaña "Chat". Debe cargar el historial de
   últimos 10 mensajes y mostrar el indicador "En vivo". Envía un
   mensaje.
   👉 Evidencia: el mensaje apareciendo de inmediato — y, si tienes el
   frontend React abierto al mismo tiempo con otro usuario, verás el
   mensaje llegar también ahí (mismo backend, mismo canal).

## 7. Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Connection refused` al hacer login | El backend no está corriendo, o el emulador no puede alcanzar `10.0.2.2` | Confirma que `npm start` sigue corriendo; si usas Windows Firewall, permite el puerto 3001 |
| La app compila pero queda en blanco | Faltó `flutter create .` antes de `flutter pub get` | Corre `flutter create .` dentro de `mobile_app/` |
| `Failed to fetch` / timeout en dispositivo físico | Sigues usando `10.0.2.2` o `localhost` en un celular real | Configura `manualHostOverride` con tu IP LAN (paso 5) |
| Emulador no aparece en `flutter devices` | El emulador no está iniciado | `flutter emulators --launch <nombre>` antes de `flutter run` |
| Error de versión de paquetes al hacer `flutter pub get` | Tu Flutter SDK es más antiguo que las versiones fijadas en `pubspec.yaml` | Corre `flutter upgrade`, o baja ligeramente las versiones en `pubspec.yaml` si no puedes actualizar el SDK |
