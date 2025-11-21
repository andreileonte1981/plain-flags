import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

enum Role {
  @JsonValue('superadmin')
  superadmin,
  @JsonValue('admin')
  admin,
  @JsonValue('user')
  user,
  @JsonValue('demo')
  demo,
}

@JsonSerializable()
class User {
  final String id;
  final String email;
  final Role role;

  User({required this.id, required this.email, required this.role});

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  String get roleDisplayName {
    switch (role) {
      case Role.superadmin:
        return 'Super Admin';
      case Role.admin:
        return 'Admin';
      case Role.user:
        return 'User';
      case Role.demo:
        return 'Demo';
    }
  }

  bool get isAdmin => role == Role.admin || role == Role.superadmin;
}
