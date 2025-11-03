// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'flag.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Flag _$FlagFromJson(Map<String, dynamic> json) => Flag(
  id: json['id'] as String,
  name: json['name'] as String,
  isOn: json['isOn'] as bool,
  stale: json['stale'] as bool,
  constraints: (json['constraints'] as List<dynamic>)
      .map((e) => Constraint.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$FlagToJson(Flag instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'isOn': instance.isOn,
  'stale': instance.stale,
  'constraints': instance.constraints,
};
