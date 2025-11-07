import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'current_flag_id.g.dart';

@riverpod
class CurrentFlagId extends _$CurrentFlagId {
  @override
  String build() {
    return '';
  }

  void setFlagId(String flagId) {
    state = flagId;
  }

  void clearFlagId() {
    state = '';
  }

  String get flagId => state;
}
