// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'history.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

History _$HistoryFromJson(Map<String, dynamic> json) => History(
  userEmail: json['userEmail'] as String,
  what: json['what'] as String,
  when: json['when'] as String,
  constraintInfo: json['constraintInfo'] as String?,
);

Map<String, dynamic> _$HistoryToJson(History instance) => <String, dynamic>{
  'userEmail': instance.userEmail,
  'what': instance.what,
  'when': instance.when,
  'constraintInfo': instance.constraintInfo,
};
