// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'constraint.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Constraint _$ConstraintFromJson(Map<String, dynamic> json) => Constraint(
  id: json['id'] as String,
  description: json['description'] as String,
  key: json['key'] as String,
  values: (json['values'] as List<dynamic>).map((e) => e as String).toList(),
  flags:
      (json['flags'] as List<dynamic>?)
          ?.map((e) => Flag.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
);

Map<String, dynamic> _$ConstraintToJson(Constraint instance) =>
    <String, dynamic>{
      'id': instance.id,
      'description': instance.description,
      'key': instance.key,
      'values': instance.values,
      'flags': instance.flags,
    };
