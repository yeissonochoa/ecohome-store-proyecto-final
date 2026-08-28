/// lib/models/product.dart
/// ---------------------------------------------------------------------
/// Modelo de producto, incluyendo la trazabilidad agregada en la
/// Unidad 3 (creatorUsername), tal como lo devuelve el backend.
/// ---------------------------------------------------------------------
class Product {
  final String id;
  final String name;
  final double price;
  final bool isActive;
  final int stock;
  final String? createdBy;
  final String? creatorUsername;
  final DateTime createdAt;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.isActive,
    required this.stock,
    required this.createdBy,
    required this.creatorUsername,
    required this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      isActive: json['isActive'] as bool,
      stock: json['stock'] as int,
      createdBy: json['createdBy'] as String?,
      creatorUsername: json['creatorUsername'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
