import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../models/user.dart';
import '../providers/auth_provider.dart';
import '../services/api_client.dart';

/// lib/screens/catalog_screen.dart
/// ---------------------------------------------------------------------
/// Entregable de la Actividad 3: lista productos mostrando el creador,
/// muestra "Nombre (N)" del usuario autenticado, y permite crear
/// productos (si es admin) actualizando el contador de inmediato en
/// pantalla — el mismo comportamiento que Catalog.jsx en React, contra
/// el mismo backend.
/// ---------------------------------------------------------------------
class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  List<Product> _products = [];
  UserStats? _stats;
  bool _loading = true;
  String? _error;

  final _nameController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController();
  bool _submitting = false;

  static const _primaryGreen = Color(0xFF1F4E3D);
  static const _accentGreen = Color(0xFF2E7D5B);

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    final token = context.read<AuthProvider>().token!;
    setState(() => _error = null);
    try {
      final results = await Future.wait([
        ApiClient.getProducts(token: token),
        ApiClient.getMyStats(token),
      ]);
      setState(() {
        _products = results[0] as List<Product>;
        _stats = results[1] as UserStats;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _createProduct() async {
    final token = context.read<AuthProvider>().token!;
    final name = _nameController.text.trim();
    final price = double.tryParse(_priceController.text.trim());
    final stock = int.tryParse(_stockController.text.trim()) ?? 0;

    if (name.isEmpty || price == null || price <= 0) {
      setState(() => _error = 'Nombre y precio (> 0) son obligatorios.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await ApiClient.createProduct(token: token, name: name, price: price, stock: stock);
      _nameController.clear();
      _priceController.clear();
      _stockController.clear();
      // Recarga catálogo + stats: hace que el contador pase de
      // "Arturo (N)" a "Arturo (N+1)" de inmediato, igual que en React.
      await _loadAll();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isAdmin = user?.isAdmin ?? false;
    final currencyFmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$');
    final dateFmt = DateFormat('d MMM, HH:mm', 'es_CO');

    return RefreshIndicator(
      onRefresh: _loadAll,
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_stats != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          _stats!.label,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: _primaryGreen,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'productos creados por ti',
                          style: TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                if (_error != null)
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFB3432F).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_error!, style: const TextStyle(color: Color(0xFFB3432F))),
                  ),
                if (isAdmin) _buildCreateForm(),
                const SizedBox(height: 8),
                if (_products.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 40),
                    child: Center(child: Text('Todavía no hay productos en el catálogo.')),
                  )
                else
                  ..._products.map((p) => _buildProductCard(p, currencyFmt, dateFmt)),
              ],
            ),
    );
  }

  Widget _buildCreateForm() {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Nombre del producto', isDense: true),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _priceController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Precio', isDense: true),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _stockController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Stock', isDense: true),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitting ? null : _createProduct,
                style: ElevatedButton.styleFrom(backgroundColor: _accentGreen, foregroundColor: Colors.white),
                child: Text(_submitting ? 'Creando…' : 'Crear producto'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(Product p, NumberFormat currencyFmt, DateFormat dateFmt) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                ),
                Text(
                  currencyFmt.format(p.price),
                  style: const TextStyle(fontWeight: FontWeight.w700, color: _accentGreen),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Stock: ${p.stock} · ${p.isActive ? "Disponible" : "Agotado"}',
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 6),
            Text.rich(
              TextSpan(
                style: const TextStyle(fontSize: 12, color: Colors.black54),
                children: [
                  const TextSpan(text: 'Creado por '),
                  TextSpan(
                    text: p.creatorUsername ?? 'desconocido',
                    style: const TextStyle(fontWeight: FontWeight.w600, color: _primaryGreen),
                  ),
                  TextSpan(text: ' · ${dateFmt.format(p.createdAt)}'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
