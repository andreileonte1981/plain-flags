import 'package:json_annotation/json_annotation.dart';
import 'package:plainflags_app/domain/flag.dart';

part 'archived_flags_response.g.dart';

@JsonSerializable()
class ArchivedFlagsResponse {
  final List<Flag> flags;
  final int count;

  ArchivedFlagsResponse({required this.flags, required this.count});

  factory ArchivedFlagsResponse.fromJson(Map<String, dynamic> json) =>
      _$ArchivedFlagsResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ArchivedFlagsResponseToJson(this);
}
