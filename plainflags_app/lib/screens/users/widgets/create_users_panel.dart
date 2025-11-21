import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';

class CreateUsersPanel extends ConsumerStatefulWidget {
  final VoidCallback onUsersCreated;
  final VoidCallback onClose;

  const CreateUsersPanel({
    super.key,
    required this.onUsersCreated,
    required this.onClose,
  });

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

    // Ask for confirmation
    final emailsString = _emailsController.text.trim();
    final emails = _parseEmails(emailsString);
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Confirm Create'),
            content: Text(
              'Create ${emails.length} user${emails.length > 1 ? 's' : ''} with the following emails?\n\n${emails.join(', ')}',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Create'),
              ),
            ],
          ),
        ) ??
        false;

    if (!confirmed) return;

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

      final response = await Client.post('users/bulk', {
        'emails': emailsString,
      }, userStatus.token);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Success
        _emailsController.clear();
        widget.onClose();
        widget.onUsersCreated();
        if (mounted) {
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
    return Card(
      shape: RoundedRectangleBorder(
        side: const BorderSide(
          color: Color.fromARGB(255, 0, 139, 105),
          width: 2.0,
        ),
      ),
      color: const Color.fromARGB(255, 189, 255, 239),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'Create Users',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.cancel),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Enter email addresses separated by commas:',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailsController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'user1@example.com, user2@example.com',
                filled: true,
                fillColor: Colors.white,
                border: const OutlineInputBorder(),
                contentPadding: const EdgeInsets.all(12),
                suffixIcon: _isLoading
                    ? const Padding(
                        padding: EdgeInsets.all(14.0),
                        child: SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    : IconButton(
                        icon: const Icon(Icons.add_circle),
                        onPressed: _createUsers,
                      ),
              ),
              enabled: !_isLoading,
              onSubmitted: (_) => _createUsers(),
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
    );
  }
}
