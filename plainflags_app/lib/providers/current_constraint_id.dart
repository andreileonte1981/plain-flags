import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'current_constraint_id.g.dart';

@riverpod
class CurrentConstraintId extends _$CurrentConstraintId {
  @override
  String build() {
    return '';
  }

  void setConstraintId(String constraintId) {
    state = constraintId;
  }

  void clearConstraintId() {
    state = '';
  }

  String get constraintId => state;
}
