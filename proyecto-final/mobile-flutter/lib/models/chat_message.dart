/// lib/models/chat_message.dart
/// ---------------------------------------------------------------------
/// Modelo de mensaje de chat, igual a lo que emite Socket.IO en los
/// eventos 'chat-history' y 'new-message'.
/// ---------------------------------------------------------------------
class ChatMessage {
  final String id;
  final String userId;
  final String username;
  final String text;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.userId,
    required this.username,
    required this.text,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      userId: json['userId'] as String,
      username: json['username'] as String,
      text: json['text'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
