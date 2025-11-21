import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';

class CreateAdminPanel extends ConsumerStatefulWidget {
  final VoidCallback onAdminCreated;
  final VoidCallback onClose;

  const CreateAdminPanel({
    super.key,
    required this.onAdminCreated,
    required this.onClose,
  });

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

    // Ask for confirmation
    final email = _emailController.text.trim();
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Confirm Create'),
            content: Text('Create admin user with email "$email"?'),
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
        'emails': email,
        'role': 'admin',
      }, userStatus.token);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Success
        _emailController.clear();
        widget.onClose();
        widget.onAdminCreated();
        if (mounted) {
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
                    'Create Admin',
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
              'Enter admin email address:',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                hintText: 'admin@example.com',
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
                        onPressed: _createAdmin,
                      ),
              ),
              enabled: !_isLoading,
              keyboardType: TextInputType.emailAddress,
              onSubmitted: (_) => _createAdmin(),
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
