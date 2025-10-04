// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'constraint.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Constraint _$ConstraintFromJson(Map<String, dynamic> json) => Constraint(
  key: json['key'] as String,
  values: (json['values'] as List<dynamic>).map((e) => e as String).toList(),
);

Map<String, dynamic> _$ConstraintToJson(Constraint instance) =>
    <String, dynamic>{'key': instance.key, 'values': instance.values};
