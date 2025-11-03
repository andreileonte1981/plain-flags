import 'package:flutter/material.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/utils/emailcheck.dart';

class Register extends StatefulWidget {
  const Register({super.key});

  @override
  State<Register> createState() => _RegisterState();
}

class _RegisterState extends State<Register> {
  final _formGlobalKey = GlobalKey<FormState>();

  String _email = '';
  String _password = '';

  Future<void> _register() async {
    try {
      final response = await Client.post('users', {
        'email': _email,
        'password': _password,
      }, null);

      if (response.statusCode == 201) {
        // Handle successful registration
        final data = response.body as Map<String, dynamic>;

        // Store token or user data as needed
        if (mounted) {
          Navigator.pop(context, data['email']);
        }
      } else {
        // Handle error response
        final errorData = response.body as Map<String, dynamic>;
        final errorMessage = errorData['message'] ?? 'Signing up failed';

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
        ).showSnackBar(SnackBar(content: Text('Signing up failed')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sign Up')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Form(
            key: _formGlobalKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                TextFormField(
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email'),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    } else if (!RegExp(emailCheck).hasMatch(value)) {
                      return 'Please enter a valid email address';
                    }
                    return null;
                  },
                  onSaved: (value) {
                    _email = value ?? '';
                  },
                ),
                const SizedBox(height: 8),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Password'),
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                  onSaved: (value) {
                    _password = value ?? '';
                  },
                ),
                const SizedBox(height: 8),
                TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Confirm Password',
                  ),
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    } else if (value != _password) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    _formGlobalKey.currentState!.save();
                    if (_formGlobalKey.currentState!.validate()) {
                      _register();
                    }
                  },
                  child: const Text('Register'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
