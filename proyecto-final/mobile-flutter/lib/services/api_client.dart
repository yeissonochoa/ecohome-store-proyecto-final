import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env.dart';
import '../models/user.dart';
import '../models/product.dart';

/// lib/services/api_client.dart
/// ---------------------------------------------------------------------
/// Cliente REST equivalente a src/api/httpClient.js del frontend React:
/// mismos endpoints, mismo backend, mismo contrato JSON. Es la prueba
/// concreta de que Flutter "consume los mismos servicios que React sin
/// cambios en endpoints" (objetivo de la Actividad 1).
/// ---------------------------------------------------------------------
class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}

class ApiClient {
  static Uri _uri(String path) => Uri.parse('${Env.apiBaseUrl}$path');

  static Map<String, String> _headers([String? token]) => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  static Map<String, dynamic> _decode(http.Response res) {
    final Map<String, dynamic> body =
        res.body.isNotEmpty ? jsonDecode(res.body) as Map<String, dynamic> : {};
    if (res.statusCode < 200 || res.statusCode >= 300) {
      final message = (body['error'] as Map?)?['message'] as String? ??
          'Error ${res.statusCode}';
      throw ApiException(message);
    }
    return body;
  }

  /// POST /auth/login -> { token, user }
  static Future<({String token, AppUser user})> login(
    String email,
    String password,
  ) async {
    final res = await http.post(
      _uri('/auth/login'),
      headers: _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );
    final body = _decode(res);
    final data = body['data'] as Map<String, dynamic>;
    return (
      token: data['token'] as String,
      user: AppUser.fromJson(data['user'] as Map<String, dynamic>),
    );
  }

  /// POST /auth/signup
  static Future<AppUser> signup(String name, String email, String password) async {
    final res = await http.post(
      _uri('/auth/signup'),
      headers: _headers(),
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );
    final body = _decode(res);
    return AppUser.fromJson(body['data'] as Map<String, dynamic>);
  }

  /// GET /products -> catálogo público (con token si se pasa, aunque no es obligatorio)
  static Future<List<Product>> getProducts({String? token}) async {
    final res = await http.get(_uri('/products'), headers: _headers(token));
    final body = _decode(res);
    final list = body['data'] as List<dynamic>;
    return list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// POST /products (requiere rol admin) -> crea producto, asociado al
  /// usuario del token (trazabilidad, Actividad 2).
  static Future<Product> createProduct({
    required String token,
    required String name,
    required double price,
    required int stock,
  }) async {
    final res = await http.post(
      _uri('/products'),
      headers: _headers(token),
      body: jsonEncode({'name': name, 'price': price, 'stock': stock}),
    );
    final body = _decode(res);
    return Product.fromJson(body['data'] as Map<String, dynamic>);
  }

  /// GET /users/me/stats -> { name, productsCreated, label: "Nombre (N)" }
  static Future<UserStats> getMyStats(String token) async {
    final res = await http.get(_uri('/users/me/stats'), headers: _headers(token));
    final body = _decode(res);
    return UserStats.fromJson(body['data'] as Map<String, dynamic>);
  }
}
