import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_shell.dart';

/// lib/main.dart
/// ---------------------------------------------------------------------
/// Punto de entrada. AuthProvider restaura la sesión guardada (si
/// existe) antes de decidir si mostrar Login o HomeShell — equivalente
/// exacto a cómo App.jsx decide entre <Login/> y <Chat/> según el
/// AuthContext en el frontend React.
/// ---------------------------------------------------------------------
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es_CO');
  runApp(const EcoHomeConnectApp());
}

class EcoHomeConnectApp extends StatelessWidget {
  const EcoHomeConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        title: 'EcoHome Connect',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF1F4E3D),
            primary: const Color(0xFF1F4E3D),
          ),
          scaffoldBackgroundColor: const Color(0xFFF6F7F3),
          navigationBarTheme: NavigationBarThemeData(
            indicatorColor: const Color(0xFF1F4E3D).withOpacity(0.12),
          ),
        ),
        home: const _RootDecider(),
      ),
    );
  }
}

/// Decide la pantalla inicial según haya o no una sesión restaurada.
class _RootDecider extends StatelessWidget {
  const _RootDecider();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.isRestoring) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return auth.isAuthenticated ? const HomeShell() : const LoginScreen();
  }
}
