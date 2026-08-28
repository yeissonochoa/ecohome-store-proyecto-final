import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import 'home_shell.dart';

/// lib/screens/login_screen.dart
/// ---------------------------------------------------------------------
/// Formulario de login, entregable de la Actividad 1: consume el mismo
/// POST /auth/login que React, y guarda el JWT (vía AuthProvider ->
/// AuthStorage) para las siguientes pantallas.
/// ---------------------------------------------------------------------
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _signupMode = false;
  String? _error;

  static const _primaryGreen = Color(0xFF1F4E3D);
  static const _accentGreen = Color(0xFF2E7D5B);
  static const _bg = Color(0xFFF6F7F3);

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      if (_signupMode) {
        await ApiClient.signup(
          _emailController.text.split('@').first,
          _emailController.text.trim(),
          _passwordController.text,
        );
        setState(() => _signupMode = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Cuenta creada. Ahora inicia sesión.')),
          );
        }
      } else {
        final auth = context.read<AuthProvider>();
        await auth.login(_emailController.text.trim(), _passwordController.text);
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const HomeShell()),
          );
        }
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Card(
              elevation: 6,
              shadowColor: _primaryGreen.withOpacity(0.2),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(28, 36, 28, 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'EcoHome Connect',
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: _primaryGreen,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'CHAT INTERNO · VENTAS · LOGÍSTICA · SOPORTE',
                        style: TextStyle(
                          fontSize: 10.5,
                          letterSpacing: 1.0,
                          color: _accentGreen,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        _signupMode
                            ? 'Crea tu cuenta de EcoHome Store.'
                            : 'Inicia sesión con tu cuenta de EcoHome Store para entrar al catálogo y al chat en tiempo real.',
                        style: const TextStyle(fontSize: 13.5, color: Colors.black54, height: 1.4),
                      ),
                      const SizedBox(height: 20),
                      if (_error != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFB3432F).withOpacity(0.08),
                            border: Border.all(color: const Color(0xFFB3432F).withOpacity(0.3)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(_error!, style: const TextStyle(color: Color(0xFFB3432F), fontSize: 13)),
                        ),
                        const SizedBox(height: 14),
                      ],
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Correo corporativo',
                          border: OutlineInputBorder(),
                        ),
                        validator: (v) => (v == null || !v.contains('@')) ? 'Correo inválido' : null,
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Contraseña',
                          border: OutlineInputBorder(),
                        ),
                        validator: (v) => (v == null || v.length < 6) ? 'Mínimo 6 caracteres' : null,
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton(
                          onPressed: _loading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _primaryGreen,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: _loading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Text(_signupMode ? 'Crear cuenta' : 'Entrar al chat'),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Center(
                        child: TextButton(
                          onPressed: () => setState(() {
                            _signupMode = !_signupMode;
                            _error = null;
                          }),
                          child: Text(
                            _signupMode
                                ? '¿Ya tienes cuenta? Inicia sesión'
                                : '¿No tienes cuenta? Regístrate',
                            style: const TextStyle(color: _accentGreen, fontSize: 13),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
