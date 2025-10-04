import 'package:json_annotation/json_annotation.dart';

import 'constraint.dart';

part 'flag_state.g.dart';

@JsonSerializable()
class FlagState {
  bool isOn = false;

  List<Constraint> constraints;

  FlagState({required this.isOn, required this.constraints});

  factory FlagState.fromJson(Map<String, dynamic> json) =>
      _$FlagStateFromJson(json);

  Map<String, dynamic> toJson() => _$FlagStateToJson(this);
}

typedef FlagStates = Map<String, FlagState>;
