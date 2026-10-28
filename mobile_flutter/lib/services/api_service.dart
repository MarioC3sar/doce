import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/api_config.dart';
import '../models/models.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;
  @override
  String toString() => message;
}

class ApiService {
  ApiService({http.Client? client, FlutterSecureStorage? storage})
    : _client = client ?? http.Client(),
      _storage = storage ?? const FlutterSecureStorage();
  final http.Client _client;
  final FlutterSecureStorage _storage;
  static const _tokenKey = 'userToken';

  Future<String?> readToken() => _storage.read(key: _tokenKey);
  Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);
  Future<void> clearToken() => _storage.delete(key: _tokenKey);

  Future<dynamic> _request(
    String method,
    String path, {
    Object? body,
    bool authenticated = true,
    Map<String, String>? query,
  }) async {
    final baseUrl = ApiConfig.baseUrl.replaceFirst(RegExp(r'/+$'), '');
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (authenticated) {
      final token = await readToken();
      if (token == null || token.isEmpty) {
        throw const ApiException('Sessão expirada. Entre novamente.');
      }
      headers['Authorization'] = 'Bearer $token';
    }
    try {
      final request = http.Request(method, uri)..headers.addAll(headers);
      if (body != null) request.body = jsonEncode(body);
      final streamed = await _client
          .send(request)
          .timeout(const Duration(seconds: 20));
      final response = await http.Response.fromStream(
        streamed,
      ).timeout(const Duration(seconds: 20));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        final message =
            response.body.isNotEmpty
                ? response.body
                : 'Falha HTTP ${response.statusCode}';
        throw ApiException(message, statusCode: response.statusCode);
      }
      if (response.statusCode == 204 || response.body.isEmpty) return null;
      try {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } on FormatException {
        throw const ApiException('O servidor retornou uma resposta inválida.');
      }
    } on TimeoutException {
      throw const ApiException('A conexão excedeu o tempo limite.');
    } on http.ClientException {
      throw const ApiException(
        'Não foi possível conectar ao servidor. Verifique a URL e a rede.',
      );
    }
  }

  Future<String> login(String email, String password) async {
    final result = await _request(
      'POST',
      '/auth/login',
      authenticated: false,
      body: {'email': email, 'password': password},
    );
    if (result is! Map<String, dynamic>) {
      throw const ApiException('Resposta de autenticação inválida.');
    }
    final token = result['token'] ?? result['accessToken'] ?? result['jwt'];
    if (token is! String || token.isEmpty) {
      throw const ApiException('Token não encontrado na resposta.');
    }
    await saveToken(token);
    return token;
  }

  Future<List<T>> list<T>(String path, T Function(Json) parse) async =>
      ((await _request('GET', path)) as List)
          .map((e) => parse(Map<String, dynamic>.from(e)))
          .toList();
  Future<T> get<T>(String path, T Function(Json) parse) async =>
      parse(Map<String, dynamic>.from(await _request('GET', path)));
  Future<void> create(String path, Object body) async {
    await _request('POST', path, body: body);
  }

  Future<void> update(String path, Object body) async {
    await _request('PUT', path, body: body);
  }

  Future<void> delete(String path) async {
    await _request('DELETE', path);
  }

  Future<void> patch(
    String path, {
    Object? body,
    Map<String, String>? query,
  }) async {
    await _request('PATCH', path, body: body ?? {}, query: query);
  }

  Future<void> patchOrderStatus(
    int id, {
    String? status,
    String? paymentStatus,
  }) async {
    await _request(
      'PATCH',
      '/api/orders/$id/status',
      body: {},
      query: {
        if (status != null) 'status': status,
        if (paymentStatus != null) 'paymentStatus': paymentStatus,
      },
    );
  }

  Future<dynamic> getRaw(String path) => _request('GET', path);
  Future<dynamic> postRaw(String path, Object body) =>
      _request('POST', path, body: body);
  Future<dynamic> putRaw(String path, Object body) =>
      _request('PUT', path, body: body);
}
