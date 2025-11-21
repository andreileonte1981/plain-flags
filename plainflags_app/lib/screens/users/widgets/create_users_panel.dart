import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';

class CreateUsersPanel extends ConsumerStatefulWidget {
  final VoidCallback onUsersCreated;

  const CreateUsersPanel({super.key, required this.onUsersCreated});

  @override
  ConsumerState<CreateUsersPanel> createState() => _CreateUsersPanelState();
}

class _CreateUsersPanelState extends ConsumerState<CreateUsersPanel> {
  final TextEditingController _emailsController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailsController.dispose();
    super.dispose();
  }

  List<String> _parseEmails(String input) {
    return input
        .split(',')
        .map((email) => email.trim())
        .where((email) => email.isNotEmpty)
        .toList();
  }

  bool _validateEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return emailRegex.hasMatch(email);
  }

  String? _validateEmails() {
    final input = _emailsController.text.trim();
    if (input.isEmpty) {
      return 'Please enter at least one email address';
    }

    final emails = _parseEmails(input);
    if (emails.isEmpty) {
      return 'Please enter at least one valid email address';
    }

    for (final email in emails) {
      if (!_validateEmail(email)) {
        return 'Invalid email format: $email';
      }
    }

    return null;
  }

  Future<void> _createUsers() async {
    final validationError = _validateEmails();
    if (validationError != null) {
      setState(() {
        _errorMessage = validationError;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final userStatus = ref.read(userStatusNotifierProvider);
      if (!userStatus.isLoggedIn) {
        setState(() {
          _errorMessage = 'User not logged in';
        });
        return;
      }

      final emailsString = _emailsController.text.trim();
      final emails = _parseEmails(
        emailsString,
      ); // Keep for success message count
      final response = await Client.post('users/bulk', {
        'emails': emailsString,
      }, userStatus.token);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Success
        _emailsController.clear();
        widget.onUsersCreated();
        if (mounted) {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                '${emails.length} user${emails.length > 1 ? 's' : ''} created successfully',
              ),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        // Handle server error
        final errorData = response.body;
        final errorMsg = errorData is Map && errorData.containsKey('message')
            ? errorData['message']
            : 'Failed to create users';
        setState(() {
          _errorMessage = errorMsg;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error: ${e.toString()}';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create Users'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter email addresses separated by commas:',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailsController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'user1@example.com, user2@example.com',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.all(12),
              ),
              enabled: !_isLoading,
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 8),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 14),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _createUsers,
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Create'),
        ),
      ],
    );
  }
}
