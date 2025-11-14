import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:plainflags_app/utils/dlog.dart';

class Connections {
  static String currentConnectionKey = '';
  static Map<String, String> connections = {};

  static String demoConnection = 'https://demoservice.plainflags.dev';
  // static String demoConnection = 'http://192.168.0.60:5000';

  static void add(String name, String url) {
    if (name == demoConnection) {
      return;
    }

    connections[name] = url;
  }

  static void forget(String name) {
    connections.remove(name);
    if (currentConnectionKey == name) {
      currentConnectionKey = '';
    }
  }

  static void select(String name) {
    if (connections.containsKey(name) || name == demoConnection) {
      currentConnectionKey = name;
    }
  }

  static bool isDemo() {
    return currentConnectionKey == demoConnection;
  }

  static Future<void> save() async {
    final FlutterSecureStorage storage = const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
    );

    final connectionsJson = connections.entries
        .map(
          (e) =>
              '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}',
        )
        .join('&');

    await storage.write(key: 'currentConnection', value: currentConnectionKey);
    await storage.write(key: 'connections', value: connectionsJson);
  }

  static Future<void> init() async {
    final FlutterSecureStorage storage = const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
    );

    final connectionsJson = await storage.read(key: 'connections');

    if (connectionsJson != null) {
      final entries = connectionsJson.split('&');
      for (var entry in entries) {
        final keyValue = entry.split('=');
        if (keyValue.length == 2) {
          final key = Uri.decodeComponent(keyValue[0]);
          final value = Uri.decodeComponent(keyValue[1]);
          connections[key] = value;
        }
      }
    }

    final currentKey = await storage.read(key: 'currentConnection');
    if (currentKey != null) {
      select(currentKey);
    }

    dlog('Current connection: $currentConnectionKey');
  }
}
