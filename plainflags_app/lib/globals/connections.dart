import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:plainflags_app/utils/dlog.dart';

class Connections {
  static String currentConnectionKey = '';
  static Map<String, String> connections = {};
  static Map<String, Map<String, dynamic>> capabilities = {};

  static String demoConnection = 'https://demoservice.plainflags.dev';
  // static String demoConnection = 'http://192.168.0.60:5000';

  static void add(String url, String passkey) {
    if (url == demoConnection) {
      return;
    }

    connections[url] = passkey;
  }

  static void setCapabilities(String url, Map<String, dynamic> caps) {
    capabilities[url] = caps;
  }

  static bool canChangePassword() {
    final caps = capabilities[currentConnectionKey];
    if (caps == null) return true;
    return caps['changepassword'] != false;
  }

  static bool useFirebaseLogin() {
    final caps = capabilities[currentConnectionKey];
    if (caps == null) return false;
    return caps['firebase'] == true;
  }

  static bool canResetPassword() {
    final caps = capabilities[currentConnectionKey];
    if (caps == null) return false;
    return caps['resetpassword'] == true;
  }

  static void forget(String url) {
    connections.remove(url);
    capabilities.remove(url);
    if (currentConnectionKey == url) {
      currentConnectionKey = '';
    }
  }

  static void select(String url) {
    if (connections.containsKey(url) || url == demoConnection) {
      currentConnectionKey = url;
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
    await storage.write(key: 'capabilities', value: jsonEncode(capabilities));
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

    final capabilitiesJson = await storage.read(key: 'capabilities');
    if (capabilitiesJson != null) {
      try {
        final decoded = jsonDecode(capabilitiesJson) as Map<String, dynamic>;
        for (final entry in decoded.entries) {
          if (entry.value is Map) {
            capabilities[entry.key] = Map<String, dynamic>.from(
              entry.value as Map,
            );
          }
        }
      } catch (_) {}
    }

    final currentKey = await storage.read(key: 'currentConnection');
    if (currentKey != null) {
      select(currentKey);
    }

    dlog('Current connection: $currentConnectionKey');
  }
}
