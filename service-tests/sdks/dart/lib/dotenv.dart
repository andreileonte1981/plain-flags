import 'dart:io';

class DotEnv {
  static final Map<String, String> _env = {};

  static Future<void> init() async {
    final file = await File('.env').readAsLines();
    for (var line in file) {
      if (line.trim().isEmpty || line.startsWith('#')) continue;
      final parts = line.split('=');
      if (parts.length >= 2) {
        final key = parts[0].trim();
        final value = parts.sublist(1).join('=').trim();
        _env[key] = value;
      }
    }
  }

  static String? get(String key) {
    return _env[key];
  }
}
