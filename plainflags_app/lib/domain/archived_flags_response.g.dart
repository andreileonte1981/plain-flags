// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'archived_flags_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ArchivedFlagsResponse _$ArchivedFlagsResponseFromJson(
  Map<String, dynamic> json,
) => ArchivedFlagsResponse(
  flags: (json['flags'] as List<dynamic>)
      .map((e) => Flag.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: (json['count'] as num).toInt(),
);

Map<String, dynamic> _$ArchivedFlagsResponseToJson(
  ArchivedFlagsResponse instance,
) => <String, dynamic>{'flags': instance.flags, 'count': instance.count};
