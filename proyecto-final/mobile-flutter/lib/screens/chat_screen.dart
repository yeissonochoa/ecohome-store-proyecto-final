import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/chat_message.dart';
import '../providers/auth_provider.dart';
import '../services/socket_service.dart';

/// lib/screens/chat_screen.dart
/// ---------------------------------------------------------------------
/// Último entregable de la Actividad 1: conecta al mismo Socket.IO que
/// usa React, autenticado con el mismo JWT, recibe el historial de
/// últimos 10 mensajes y permite enviar/recibir en tiempo real.
/// ---------------------------------------------------------------------
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final SocketService _socketService = SocketService();
  final List<ChatMessage> _messages = [];
  final _draftController = TextEditingController();
  final _scrollController = ScrollController();

  bool _connected = false;
  String? _error;

  static const _primaryGreen = Color(0xFF1F4E3D);
  static const _accentGreen = Color(0xFF2E7D5B);

  @override
  void initState() {
    super.initState();
    final token = context.read<AuthProvider>().token!;

    _socketService.connect(
      token: token,
      onConnect: () => setState(() => _connected = true),
      onDisconnect: (_) => setState(() => _connected = false),
      onHistory: (history) {
        setState(() {
          _messages
            ..clear()
            ..addAll(history);
        });
        _scrollToBottom();
      },
      onNewMessage: (msg) {
        setState(() => _messages.add(msg));
        _scrollToBottom();
      },
      onError: (message) {
        setState(() => _error = message);
        Future.delayed(const Duration(seconds: 4), () {
          if (mounted) setState(() => _error = null);
        });
      },
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send() {
    final text = _draftController.text.trim();
    if (text.isEmpty) return;
    _socketService.sendMessage(text);
    _draftController.clear();
  }

  @override
  void dispose() {
    _socketService.disconnect();
    _draftController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentUsername = context.watch<AuthProvider>().user?.email;
    final timeFmt = DateFormat('HH:mm');

    return Column(
      children: [
        Container(
          width: double.infinity,
          color: _primaryGreen.withOpacity(0.06),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _connected ? const Color(0xFF7FD99A) : Colors.grey,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                _connected ? 'En vivo' : 'Reconectando…',
                style: const TextStyle(fontSize: 12, fontFamily: 'monospace', color: _primaryGreen),
              ),
            ],
          ),
        ),
        if (_error != null)
          Container(
            width: double.infinity,
            color: const Color(0xFFB3432F).withOpacity(0.08),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(_error!, style: const TextStyle(color: Color(0xFFB3432F), fontSize: 12.5)),
          ),
        Expanded(
          child: _messages.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'Todavía no hay mensajes en este canal. Escribe el primero para coordinar con Ventas, Logística o Soporte.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.black54),
                    ),
                  ),
                )
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final m = _messages[index];
                    final isOwn = m.username == currentUsername;
                    return Align(
                      alignment: isOwn ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.72,
                        ),
                        child: Column(
                          crossAxisAlignment:
                              isOwn ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: Text(
                                '${isOwn ? "Tú" : m.username} · ${timeFmt.format(m.createdAt)}',
                                style: const TextStyle(fontSize: 10.5, color: Colors.black45),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
                              decoration: BoxDecoration(
                                color: isOwn ? _primaryGreen : Colors.white,
                                border: isOwn ? null : Border.all(color: Colors.black12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                m.text,
                                style: TextStyle(
                                  color: isOwn ? Colors.white : Colors.black87,
                                  fontSize: 14.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        SafeArea(
          top: false,
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.black.withOpacity(0.08))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _draftController,
                    decoration: InputDecoration(
                      hintText: 'Escribe un mensaje para el equipo…',
                      filled: true,
                      fillColor: const Color(0xFFF6F7F3),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(22),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: _accentGreen,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 18),
                    onPressed: _send,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
