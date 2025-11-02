import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'user_status.g.dart';

class UserStatus {
  bool isLoggedIn;
  String email;
  String token;

  UserStatus({this.isLoggedIn = false, this.email = '', this.token = ''});
}

@riverpod
class UserStatusNotifier extends _$UserStatusNotifier {
  UserStatus userStatus = UserStatus();

  @override
  UserStatus build() {
    return userStatus;
  }

  void setLoggedIn(String email, String token) {
    state = UserStatus(isLoggedIn: true, email: email, token: token);
    ref.keepAlive();
  }

  void setLoggedOut() {
    state = UserStatus(isLoggedIn: false, email: '', token: '');
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
