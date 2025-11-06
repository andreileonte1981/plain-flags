import 'package:json_annotation/json_annotation.dart';

part 'history.g.dart';

@JsonSerializable()
class History {
  final String userEmail;
  final String what;
  final String when;

  @JsonKey(defaultValue: null)
  final String? constraintInfo;

  History({
    required this.userEmail,
    required this.what,
    required this.when,
    required this.constraintInfo,
  });

  factory History.fromJson(Map<String, dynamic> json) =>
      _$HistoryFromJson(json);
  Map<String, dynamic> toJson() => _$HistoryToJson(this);
}
