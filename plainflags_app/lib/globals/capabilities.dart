import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:plainflags_app/utils/dlog.dart';

class Capabilities {
  static bool _disableUserRegistration = false;

  static bool get disableUserRegistration => _disableUserRegistration;

  static void setDisableUserRegistration(bool value) {
    _disableUserRegistration = value;
  }

  static Future<void> init() async {
    final storage = FlutterSecureStorage(
      aOptions: const AndroidOptions(encryptedSharedPreferences: true),
    );

    final disableUserRegistrationValue = await storage.read(
      key: 'disable_user_registration',
    );

    if (disableUserRegistrationValue != null) {
      _disableUserRegistration =
          disableUserRegistrationValue.toLowerCase() == 'true';
    }

    dlog(
      'Capabilities initialized: disableUserRegistration=$_disableUserRegistration',
    );
  }

  static Future<void> save() async {
    final storage = FlutterSecureStorage(
      aOptions: const AndroidOptions(encryptedSharedPreferences: true),
    );

    await storage.write(
      key: 'disable_user_registration',
      value: _disableUserRegistration.toString(),
    );
  }
}
