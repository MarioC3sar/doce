import 'package:flutter/foundation.dart';

import '../services/api_service.dart';

class Session extends ChangeNotifier {
  Session(this.api);
  final ApiService api;
  bool authenticated = false;
  bool initialized = false;
  Future<void> restore() async {
    authenticated = (await api.readToken())?.isNotEmpty ?? false;
    initialized = true;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    await api.login(email, password);
    authenticated = true;
    notifyListeners();
  }

  Future<void> logout() async {
    await api.clearToken();
    authenticated = false;
    notifyListeners();
  }
}
