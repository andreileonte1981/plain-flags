// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'flag_state.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FlagState _$FlagStateFromJson(Map<String, dynamic> json) => FlagState(
  isOn: json['isOn'] as bool,
  constraints: (json['constraints'] as List<dynamic>)
      .map((e) => Constraint.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$FlagStateToJson(FlagState instance) => <String, dynamic>{
  'isOn': instance.isOn,
  'constraints': instance.constraints,
};
