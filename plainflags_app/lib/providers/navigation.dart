import 'package:plainflags_app/providers/user_status.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'navigation.g.dart';

@riverpod
class Navigation extends _$Navigation {
  static const int flagsIndex = 0;
  static const int constraintsIndex = 1;
  static const int archivedFlagsIndex = 2;
  static const int usersIndex = 3;

  @override
  int build() {
    ref.keepAlive();
    return 0; // Default to Flags screen (index 0)
  }

  void goToFlags() {
    state = 0;
  }

  void goToConstraints() {
    state = 1;
  }

  void setIndex(int index) {
    if (index >= 0 && index <= 3) {
      state = index;
    }
  }

  void updateToRole(String role) {
    if (role == Role.admin || role == Role.superadmin) {
      // Admins can access all screens; do not change the index
      return;
    } else {
      // Non-admin users can only access Flags and Constraints
      if (state >= 2) {
        state = 0; // Redirect to Flags screen
      }
    }
  }

  int get currentIndex => state;

  bool get isOnFlags => state == 0;
  bool get isOnConstraints => state == 1;
}
