import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/user.dart' as user_domain;
import 'package:plainflags_app/providers/users_provider.dart';
import 'package:plainflags_app/providers/user_status.dart';

class DeleteUserButton extends ConsumerStatefulWidget {
  final user_domain.User user;
  final String currentUserEmail;
  final user_domain.Role currentUserRole;
  final VoidCallback onUserDeleted;

  const DeleteUserButton({
    super.key,
    required this.user,
    required this.currentUserEmail,
    required this.currentUserRole,
    required this.onUserDeleted,
  });

  @override
  ConsumerState<DeleteUserButton> createState() => _DeleteUserButtonState();
}

class _DeleteUserButtonState extends ConsumerState<DeleteUserButton> {
  bool _isDeleting = false;

  bool _canDelete() {
    // Cannot delete super admin
    if (widget.user.role == user_domain.Role.superadmin) {
      return false;
    }

    // Super admin can delete anyone (except other super admins)
    if (widget.currentUserRole == user_domain.Role.superadmin) {
      return true;
    }

    // Cannot delete yourself
    if (widget.user.email == widget.currentUserEmail) {
      return false;
    }

    // Admin can delete users and demos
    if (widget.currentUserRole == user_domain.Role.admin) {
      return widget.user.role == user_domain.Role.user ||
          widget.user.role == user_domain.Role.demo;
    }

    // Other roles cannot delete
    return false;
  }

  String _getReasonIfCannotDelete() {
    if (widget.user.role == user_domain.Role.superadmin) {
      return 'Cannot delete super admin';
    }

    if (widget.user.email == widget.currentUserEmail) {
      return 'Cannot delete yourself';
    }

    if (widget.currentUserRole != user_domain.Role.admin &&
        widget.currentUserRole != user_domain.Role.superadmin) {
      return 'Not allowed';
    }

    if (widget.currentUserRole == user_domain.Role.admin &&
        (widget.user.role == user_domain.Role.admin ||
            widget.user.role == user_domain.Role.superadmin)) {
      return 'Cannot delete admin or super admin';
    }

    return 'Not allowed';
  }

  Future<void> _deleteUser() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Delete User'),
          content: Text(
            'Delete ${widget.user.roleDisplayName} ${widget.user.email}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Delete'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) return;

    setState(() {
      _isDeleting = true;
    });

    try {
      final userStatus = ref.read(userStatusNotifierProvider);
      await UsersService.deleteUser(
        userId: widget.user.id,
        token: userStatus.token,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('User deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        widget.onUserDeleted();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to delete user: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isDeleting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final canDelete = _canDelete();

    if (_isDeleting) {
      return const SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }

    if (!canDelete) {
      final reason = _getReasonIfCannotDelete();
      return Tooltip(
        message: reason,
        child: IconButton(
          onPressed: null,
          icon: const Icon(Icons.delete_outline, color: Colors.grey),
        ),
      );
    }

    return IconButton(
      onPressed: _deleteUser,
      icon: const Icon(Icons.delete_outline, color: Colors.red),
      tooltip: 'Delete user',
    );
  }
}
