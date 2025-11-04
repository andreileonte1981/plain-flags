import 'package:json_annotation/json_annotation.dart';
import 'package:plainflags_app/domain/constraint.dart';

part 'flag.g.dart';

@JsonSerializable()
class Flag {
  final String id;
  final String name;
  final bool isOn;

  @JsonKey(defaultValue: false)
  final bool stale;

  @JsonKey(defaultValue: [])
  final List<Constraint> constraints;

  Flag({
    required this.id,
    required this.name,
    required this.isOn,
    required this.stale,
    required this.constraints,
  });

  factory Flag.fromJson(Map<String, dynamic> json) => _$FlagFromJson(json);
  Map<String, dynamic> toJson() => _$FlagToJson(this);
}
