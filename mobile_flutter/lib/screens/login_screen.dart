import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/api_service.dart';
import '../state/session.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController(), _password = TextEditingController();
  bool _loading = false;
  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_email.text.trim().isEmpty || _password.text.isEmpty) {
      _message('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setState(() => _loading = true);
    try {
      await context.read<Session>().login(_email.text.trim(), _password.text);
    } on ApiException catch (e) {
      _message('Erro', e.message);
    } catch (error) {
      debugPrint('Falha ao concluir login: $error');
      _message('Erro', 'Não foi possível concluir o login: $error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _message(String title, String message) => showDialog<void>(
    context: context,
    builder:
        (_) => AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
  );
  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Bem-vindo(a)! 🧁',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF5C4D43),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Gerencie sua confeitaria com amor, organização e precisão.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Color(0xFF8C7B70),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 36),
                Card(
                  elevation: 4,
                  shadowColor: const Color(0xFFD6A284).withValues(alpha: .18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(32),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'E-mail',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF8C7B70),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _email,
                          keyboardType: TextInputType.emailAddress,
                          autocorrect: false,
                          textCapitalization: TextCapitalization.none,
                          decoration: const InputDecoration(
                            hintText: 'exemplo@confeitaria.com',
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Senha',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF8C7B70),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _password,
                          obscureText: true,
                          onSubmitted: (_) => _login(),
                          decoration: const InputDecoration(
                            hintText: '••••••••',
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          height: 56,
                          child: FilledButton(
                            onPressed: _loading ? null : _login,
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFFD6A284),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                            child:
                                _loading
                                    ? const SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                    : const Text(
                                      'Entrar',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Feito com ❤️ para negócios artesanais',
                  style: TextStyle(
                    color: Color(0xFFA3958B),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
