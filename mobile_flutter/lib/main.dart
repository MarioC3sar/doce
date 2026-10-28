import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/app_shell.dart';
import 'screens/login_screen.dart';
import 'services/api_service.dart';
import 'state/session.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => Session(ApiService())..restore(),
      child: const DoceApp(),
    ),
  );
}

class DoceApp extends StatelessWidget {
  const DoceApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Doce',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFFFDFBF7),
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFFD6A284),
        surface: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF8E44AD),
        foregroundColor: Colors.white,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFFDFBF7),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFF2E8DF)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFF2E8DF)),
        ),
      ),
    ),
    home: Consumer<Session>(
      builder:
          (context, session, _) =>
              !session.initialized
                  ? const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  )
                  : session.authenticated
                  ? const AppShell()
                  : const LoginScreen(),
    ),
  );
}
