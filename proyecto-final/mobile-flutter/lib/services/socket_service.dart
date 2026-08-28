import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/env.dart';
import '../models/chat_message.dart';

/// lib/services/socket_service.dart
/// ---------------------------------------------------------------------
/// Equivalente Flutter de src/api/socketClient.js: se conecta al mismo
/// servidor Socket.IO del backend, enviando el JWT en `auth.token`,
/// exactamente como lo valida socketAuthMiddleware en el servidor.
/// Es la prueba de que "Integración de chat Socket.IO desde Flutter
/// usando el mismo JWT" (Actividad 1) funciona sin cambios en el backend.
/// ---------------------------------------------------------------------
class SocketService {
  io.Socket? _socket;

  void connect({
    required String token,
    required void Function() onConnect,
    required void Function(String reason) onDisconnect,
    required void Function(List<ChatMessage> history) onHistory,
    required void Function(ChatMessage message) onNewMessage,
    required void Function(String message) onError,
  }) {
    _socket = io.io(
      Env.socketBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .disableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) => onConnect());
    _socket!.onDisconnect((reason) => onDisconnect(reason?.toString() ?? ''));

    _socket!.on('chat-history', (data) {
      final list = (data as List<dynamic>)
          .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
          .toList();
      onHistory(list);
    });

    // Alias: algunos backends de referencia emiten el historial bajo el
    // nombre de evento 'messages' en vez de 'chat-history'.
    _socket!.on('messages', (data) {
      final list = (data as List<dynamic>)
          .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
          .toList();
      onHistory(list);
    });

    _socket!.on('new-message', (data) {
      onNewMessage(ChatMessage.fromJson(data as Map<String, dynamic>));
    });

    _socket!.on('chat-error', (data) {
      final message = (data as Map?)?['message']?.toString() ?? 'Error en el chat.';
      onError(message);
    });

    _socket!.onConnectError((data) => onError('No se pudo conectar: $data'));

    _socket!.connect();
  }

  void sendMessage(String text) {
    _socket?.emit('new-message', {'text': text});
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}
