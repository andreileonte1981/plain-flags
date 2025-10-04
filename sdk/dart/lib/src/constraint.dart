import 'package:json_annotation/json_annotation.dart';

part 'constraint.g.dart';

@JsonSerializable()
class Constraint {
  String key;
  List<String> values;

  Constraint({required this.key, required this.values});

  factory Constraint.fromJson(Map<String, dynamic> json) =>
      _$ConstraintFromJson(json);

  Map<String, dynamic> toJson() => _$ConstraintToJson(this);
}
