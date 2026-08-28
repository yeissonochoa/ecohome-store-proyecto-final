/// lib/models/user.dart
/// ---------------------------------------------------------------------
/// Modelo de datos del usuario autenticado. Refleja exactamente el
/// mismo contrato que ya consume React (mismo backend, mismo JSON).
/// ---------------------------------------------------------------------
class AppUser {
  final String id;
  final String name;
  final String email;
  final String role;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
    );
  }

  bool get isAdmin => role == 'admin';
}

/// Estadísticas del usuario (Actividad 3: contador "Nombre (N)").
class UserStats {
  final String name;
  final int productsCreated;
  final String label;

  UserStats({
    required this.name,
    required this.productsCreated,
    required this.label,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      name: json['name'] as String,
      productsCreated: json['productsCreated'] as int,
      label: json['label'] as String,
    );
  }
}
