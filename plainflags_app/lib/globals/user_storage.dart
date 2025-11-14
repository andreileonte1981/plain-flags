import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:plainflags_app/utils/dlog.dart';

class UserCredentials {
  final String email;
  final String password;

  UserCredentials({required this.email, required this.password});
}

class UserStorage {
  static Map<String, UserCredentials> usersCredsPerConnection = {};

  static UserCredentials? credentialsForConnection(String connectionKey) {
    return usersCredsPerConnection[connectionKey];
  }

  static addCredentialsForConnection(
    String connectionKey,
    String email,
    String password,
  ) {
    usersCredsPerConnection[connectionKey] = UserCredentials(
      email: email,
      password: password,
    );
  }

  static forgetCredentialsForConnection(String connectionKey) {
    usersCredsPerConnection.remove(connectionKey);
  }

  static Future<void> init() async {
    // Load user credentials from secure storage
    final storage = FlutterSecureStorage(
      aOptions: const AndroidOptions(encryptedSharedPreferences: true),
    );

    final keysString = await storage.read(key: 'userCredKeys');

    dlog('Loaded user credential keys');

    if (keysString == null) {
      return;
    }

    final keys = keysString.split('&');

    for (var key in keys) {
      final credString = await storage.read(key: 'userCred_$key');
      if (credString != null) {
        final parts = credString.split('=');
        if (parts.length == 2) {
          final email = Uri.decodeComponent(parts[0]);
          final password = Uri.decodeComponent(parts[1]);
          addCredentialsForConnection(
            Uri.decodeComponent(key),
            email,
            password,
          );
        }
      }
    }

    dlog('Loaded user credentials for connections');
  }

  static Future<void> save() async {
    // Save user credentials to secure storage
    final storage = FlutterSecureStorage(
      aOptions: const AndroidOptions(encryptedSharedPreferences: true),
    );

    // Write all credential keys
    final String keys = usersCredsPerConnection.keys
        .map((k) => Uri.encodeComponent(k))
        .join('&');

    dlog('Saving user credential keys');
    await storage.write(key: 'userCredKeys', value: keys);

    for (var entry in usersCredsPerConnection.entries) {
      final key = Uri.encodeComponent(entry.key);
      final email = Uri.encodeComponent(entry.value.email);
      final password = Uri.encodeComponent(entry.value.password);

      final credString = '$email=$password';

      dlog('Saving credentials for connection "$key"');
      await storage.write(key: 'userCred_$key', value: credString);
    }
  }
}
