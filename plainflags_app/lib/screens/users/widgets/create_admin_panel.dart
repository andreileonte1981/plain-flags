import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';

class CreateAdminPanel extends ConsumerStatefulWidget {
  final VoidCallback onAdminCreated;

  const CreateAdminPanel({super.key, required this.onAdminCreated});

  @override
  ConsumerState<CreateAdminPanel> createState() => _CreateAdminPanelState();
}

class _CreateAdminPanelState extends ConsumerState<CreateAdminPanel> {
  final TextEditingController _emailController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  bool _validateEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return emailRegex.hasMatch(email);
  }

  String? _validateInput() {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      return 'Please enter an email address';
    }

    if (!_validateEmail(email)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  Future<void> _createAdmin() async {
    final validationError = _validateInput();
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

      final email = _emailController.text.trim();
      final response = await Client.post('users/bulk', {
        'emails': email,
        'role': 'admin',
      }, userStatus.token);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Success
        _emailController.clear();
        widget.onAdminCreated();
        if (mounted) {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Admin created successfully'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        // Handle server error
        final errorData = response.body;
        final errorMsg = errorData is Map && errorData.containsKey('message')
            ? errorData['message']
            : 'Failed to create admin';
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
      title: const Text('Create Admin'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter admin email address:',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                hintText: 'admin@example.com',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.all(12),
              ),
              enabled: !_isLoading,
              keyboardType: TextInputType.emailAddress,
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
          onPressed: _isLoading ? null : _createAdmin,
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
