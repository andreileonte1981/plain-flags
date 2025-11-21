// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: json['id'] as String,
  email: json['email'] as String,
  role: $enumDecode(_$RoleEnumMap, json['role']),
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'role': _$RoleEnumMap[instance.role]!,
};

const _$RoleEnumMap = {
  Role.superadmin: 'superadmin',
  Role.admin: 'admin',
  Role.user: 'user',
  Role.demo: 'demo',
};
