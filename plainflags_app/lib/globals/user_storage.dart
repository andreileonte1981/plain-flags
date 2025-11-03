import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class UserStorage {
  static String? email;
  static String? password;

  Future<void> init() async {
    // Load user credentials from secure storage
    final storage = FlutterSecureStorage(
      aOptions: const AndroidOptions(encryptedSharedPreferences: true),
    );

    email = await storage.read(key: 'email');
    password = await storage.read(key: 'password');
  }

  Future<void> save(String emailValue, String passwordValue) async {
    // Save user credentials to secure storage
    final storage = FlutterSecureStorage(
      aOptions: const AndroidOptions(encryptedSharedPreferences: true),
    );

    email = emailValue;
    password = passwordValue;

    if (email != null) {
      await storage.write(key: 'email', value: email);
    }
    if (password != null) {
      await storage.write(key: 'password', value: password);
    }
  }

  static Future<void> clear() async {
    // Clear user credentials from secure storage
    final storage = FlutterSecureStorage(
      aOptions: const AndroidOptions(encryptedSharedPreferences: true),
    );

    email = null;
    password = null;

    await storage.delete(key: 'email');
    await storage.delete(key: 'password');
  }
}
