import 'dart:io' show Platform;

class ApiConfig {
  ApiConfig._();

  static const _definedBaseUrl = String.fromEnvironment('API_BASE_URL');

  // Android devices use adb reverse tcp:8081 tcp:8081 during local development.
  // Override this for an emulator without adb reverse or a deployed backend.
  static String get baseUrl {
    if (_definedBaseUrl.isNotEmpty) return _definedBaseUrl;
    return Platform.isAndroid
        ? 'http://127.0.0.1:8081'
        : 'http://localhost:8081';
  }
}
