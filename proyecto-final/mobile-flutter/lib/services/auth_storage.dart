import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

/// lib/services/auth_storage.dart
/// ---------------------------------------------------------------------
/// Persiste { token, user } en almacenamiento local del dispositivo,
/// usando shared_preferences. Es el equivalente mobile exacto de
/// AuthContext.jsx en el frontend React (que usa localStorage): mismo
/// propósito, misma forma de guardar la sesión entre reinicios de la app.
/// ---------------------------------------------------------------------
class AuthStorage {
  static const _tokenKey = 'ecohome_token';
  static const _userKey = 'ecohome_user';

  static Future<void> save(String token, AppUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(
      _userKey,
      jsonEncode({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
      }),
    );
  }

  static Future<({String token, AppUser user})?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final userJson = prefs.getString(_userKey);
    if (token == null || userJson == null) return null;
    final user = AppUser.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
    return (token: token, user: user);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
