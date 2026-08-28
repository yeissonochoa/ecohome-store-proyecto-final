import 'package:flutter/foundation.dart' show kIsWeb, defaultTargetPlatform, TargetPlatform;

/// lib/config/env.dart
/// ---------------------------------------------------------------------
/// Resuelve la URL base del backend según la plataforma de ejecución.
/// Usa `defaultTargetPlatform` de Flutter (no `dart:io`), porque
/// `dart:io` no compila para Flutter Web -- este archivo debe poder
/// compilarse sin importar el target (Android, iOS, Web, Windows).
///
/// Esta es la parte mas propensa a confusion en Flutter y merece
/// explicacion:
///
///   - Web / escritorio (Windows/macOS/Linux): "localhost" funciona
///     igual que en el navegador.
///   - Emulador de Android: "localhost" DENTRO del emulador apunta al
///     propio emulador, no a tu PC. Android reserva la IP especial
///     10.0.2.2 para referirse al host que corre el emulador.
///   - iOS Simulator (macOS): si puede usar "localhost" directamente.
///   - Dispositivo fisico (Android o iOS) en la misma red Wi-Fi que tu
///     PC: ninguna de las anteriores funciona; hay que usar la IP LAN
///     real de tu PC (ej. 192.168.1.50), visible con `ipconfig` en
///     Windows.
///
/// Para no reescribir codigo, el host se resuelve automaticamente para
/// emulador/simulador/web/escritorio, y el unico caso que exige editar
/// este archivo a mano es "dispositivo fisico" (ver README de mobile_app).
/// ---------------------------------------------------------------------
class Env {
  /// Cambia esto SOLO si vas a probar en un dispositivo fisico real
  /// (no emulador/simulador). Pon aqui la IP LAN de tu PC, ej:
  /// static const String? manualHostOverride = '192.168.1.50';
  static const String? manualHostOverride = null;

  static const int backendPort = 3001; // debe coincidir con PORT en el .env del backend

  static String get _host {
    if (manualHostOverride != null) return manualHostOverride!;
    if (kIsWeb) return 'localhost';
    if (defaultTargetPlatform == TargetPlatform.android) return '10.0.2.2';
    return 'localhost'; // iOS Simulator, macOS, Windows, Linux
  }

  static String get apiBaseUrl => 'http://$_host:$backendPort/api/v1';
  static String get socketBaseUrl => 'http://$_host:$backendPort';
}
