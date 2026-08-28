import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/auth_storage.dart';

/// lib/providers/auth_provider.dart
/// ---------------------------------------------------------------------
/// Equivalente Flutter de context/AuthContext.jsx: mantiene la sesión
/// (token + user) en memoria vía ChangeNotifier y la persiste en disco
/// con AuthStorage, restaurándola automáticamente al abrir la app.
/// ---------------------------------------------------------------------
class AuthProvider extends ChangeNotifier {
  String? _token;
  AppUser? _user;
  bool _restoring = true;

  String? get token => _token;
  AppUser? get user => _user;
  bool get isAuthenticated => _token != null;
  bool get isRestoring => _restoring;

  AuthProvider() {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final saved = await AuthStorage.load();
    if (saved != null) {
      _token = saved.token;
      _user = saved.user;
    }
    _restoring = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final result = await ApiClient.login(email, password);
    _token = result.token;
    _user = result.user;
    await AuthStorage.save(result.token, result.user);
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await AuthStorage.clear();
    notifyListeners();
  }
}
