import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'catalog_screen.dart';
import 'chat_screen.dart';
import 'login_screen.dart';

/// lib/screens/home_shell.dart
/// ---------------------------------------------------------------------
/// Equivalente Flutter del AppHeader + navegación por pestañas de React
/// (Chat / Catálogo). Usa una BottomNavigationBar, el patrón estándar
/// de navegación entre pantallas en apps móviles.
/// ---------------------------------------------------------------------
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 1; // arranca en Chat, igual que en el frontend React

  static const _primaryGreen = Color(0xFF1F4E3D);

  final _screens = const [CatalogScreen(), ChatScreen()];
  final _titles = const ['Catálogo', 'EcoHome Connect'];

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: _primaryGreen,
        title: Text(_titles[_index]),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Center(
              child: Text(
                user?.email ?? '',
                style: const TextStyle(fontSize: 12, color: Colors.white70),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Salir',
            onPressed: () async {
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              }
            },
          ),
        ],
      ),
      body: _screens[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Catálogo'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
        ],
      ),
    );
  }
}
