import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'user_status.g.dart';

class Role {
  static const String admin = 'admin';
  static const String demo = 'demo';
  static const String user = 'user';
  static const String superadmin = 'superadmin';
}

class UserStatus {
  bool isLoggedIn;
  String email;
  String role;
  String token;

  UserStatus({
    this.isLoggedIn = false,
    this.email = '',
    this.role = '',
    this.token = '',
  });
}

@riverpod
class UserStatusNotifier extends _$UserStatusNotifier {
  UserStatus userStatus = UserStatus();

  @override
  UserStatus build() {
    return userStatus;
  }

  void setLoggedIn(String email, String token, String role) {
    state = UserStatus(
      isLoggedIn: true,
      email: email,
      token: token,
      role: role,
    );
    ref.keepAlive();
  }

  void setLoggedOut() {
    state = UserStatus(isLoggedIn: false, email: '', token: '', role: '');
    ref.keepAlive();
  }

  String get token {
    if (state.isLoggedIn) {
      return state.token;
    } else {
      return '';
    }
  }
}
