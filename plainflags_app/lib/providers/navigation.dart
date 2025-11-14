import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'navigation.g.dart';

@riverpod
class Navigation extends _$Navigation {
  static const int flagsIndex = 0;
  static const int constraintsIndex = 1;

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
    if (index >= 0 && index <= 1) {
      state = index;
    }
  }

  int get currentIndex => state;

  bool get isOnFlags => state == 0;
  bool get isOnConstraints => state == 1;
}
