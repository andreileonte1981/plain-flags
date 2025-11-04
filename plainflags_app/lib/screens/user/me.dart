import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/globals/connections.dart';
import 'package:plainflags_app/globals/user_storage.dart';
import 'package:plainflags_app/providers/user_status.dart';

class Me extends ConsumerStatefulWidget {
  const Me({super.key});

  @override
  ConsumerState<Me> createState() => _MeState();
}

class _MeState extends ConsumerState<Me> {
  final _formGlobalKey = GlobalKey<FormState>();

  String _currentPassword = '';
  String _newPassword = '';

  Future<void> _changePassword() async {
    try {
      final response = await Client.post('users/changePassword', {
        'currentPassword': _currentPassword,
        'newPassword': _newPassword,
      }, ref.read(userStatusNotifierProvider).token);

      if (response.statusCode == 200) {
        // Handle successful registration
        final data = response.body as Map<String, dynamic>;

        // Store token or user data as needed
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Password changed successfully')),
          );
          Navigator.pop(context, data['email']);
        }
      } else {
        // Handle error response
        final errorData = response.body as Map<String, dynamic>;
        final errorMessage = errorData['message'] ?? 'Change password failed';
        if (mounted) {
          FocusManager.instance.primaryFocus?.unfocus();

          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(errorMessage)));
        }
      }
    } catch (e) {
      if (mounted) {
        FocusManager.instance.primaryFocus?.unfocus();

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Change password failed')));
      }
    }
  }

  Future<void> handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final connection = Connections.currentConectionKey;
      UserStorage.forgetCredentialsForConnection(connection);
      UserStorage.save();

      ref.read(userStatusNotifierProvider.notifier).setLoggedOut();

      if (mounted) {
        Navigator.pop(context, "");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          ref.read(userStatusNotifierProvider).email,
          style: TextStyle(fontSize: 16),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Change password form
              Form(
                key: _formGlobalKey,
                child: Column(
                  children: [
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Current Password',
                      ),
                      obscureText: true,
                      onChanged: (value) {
                        _currentPassword = value;
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your current password';
                        }
                        return null;
                      },
                    ),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'New Password',
                      ),
                      obscureText: true,
                      onChanged: (value) {
                        _newPassword = value;
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a new password';
                        }
                        return null;
                      },
                    ),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Confirm New Password',
                      ),
                      obscureText: true,
                      onChanged: (value) {},
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please confirm your new password';
                        }
                        if (value != _newPassword) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        if (_formGlobalKey.currentState?.validate() == true) {
                          _changePassword();
                        }
                      },
                      child: const Text('Change Password'),
                    ),
                  ],
                ),
              ),
              Divider(height: 40, color: Theme.of(context).colorScheme.primary),
              ElevatedButton(
                onPressed: () {
                  handleLogout();
                },
                child: Text('Log out'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
