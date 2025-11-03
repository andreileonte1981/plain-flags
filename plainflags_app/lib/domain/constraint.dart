import 'package:json_annotation/json_annotation.dart';
import 'package:plainflags_app/domain/flag.dart';

part 'constraint.g.dart';

@JsonSerializable()
class Constraint {
  String id;
  String description;
  String key;
  List<String> values;

  @JsonKey(defaultValue: [])
  List<Flag> flags;

  Constraint({
    required this.id,
    required this.description,
    required this.key,
    required this.values,
    required this.flags,
  });

  factory Constraint.fromJson(Map<String, dynamic> json) =>
      _$ConstraintFromJson(json);
  Map<String, dynamic> toJson() => _$ConstraintToJson(this);
}
