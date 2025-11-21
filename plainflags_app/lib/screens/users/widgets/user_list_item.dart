import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/user.dart' as user_domain;
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/users/widgets/delete_user_button.dart';

class UserListItem extends ConsumerWidget {
  final user_domain.User user;
  final VoidCallback onUserDeleted;

  const UserListItem({
    super.key,
    required this.user,
    required this.onUserDeleted,
  });

  IconData _getRoleIcon(user_domain.Role role) {
    switch (role) {
      case user_domain.Role.superadmin:
      case user_domain.Role.admin:
        return Icons.admin_panel_settings;
      case user_domain.Role.user:
      case user_domain.Role.demo:
        return Icons.person;
    }
  }

  Color _getRoleColor(user_domain.Role role) {
    switch (role) {
      case user_domain.Role.superadmin:
        return Colors.purple;
      case user_domain.Role.admin:
        return Colors.blue;
      case user_domain.Role.user:
        return Colors.green;
      case user_domain.Role.demo:
        return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUserStatus = ref.watch(userStatusNotifierProvider);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          children: [
            // Email (takes most space)
            Expanded(
              flex: 3,
              child: Text(
                user.email,
                style: TextStyle(
                  fontWeight: user.isAdmin
                      ? FontWeight.bold
                      : FontWeight.normal,
                  fontSize: 16,
                ),
                softWrap: true,
                overflow: TextOverflow.visible,
              ),
            ),

            // Role with icon
            Expanded(
              flex: 2,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _getRoleIcon(user.role),
                    size: 18,
                    color: _getRoleColor(user.role),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    user.roleDisplayName,
                    style: TextStyle(
                      fontWeight: user.isAdmin
                          ? FontWeight.bold
                          : FontWeight.normal,
                      fontSize: 12,
                      color: _getRoleColor(user.role),
                    ),
                  ),
                ],
              ),
            ),

            // Delete button
            Expanded(
              flex: 1,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  DeleteUserButton(
                    user: user,
                    currentUserEmail: currentUserStatus.email,
                    currentUserRole: _parseRole(currentUserStatus.role),
                    onUserDeleted: onUserDeleted,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  user_domain.Role _parseRole(String roleString) {
    switch (roleString.toLowerCase()) {
      case 'superadmin':
        return user_domain.Role.superadmin;
      case 'admin':
        return user_domain.Role.admin;
      case 'user':
        return user_domain.Role.user;
      case 'demo':
        return user_domain.Role.demo;
      default:
        return user_domain.Role.user;
    }
  }
}
