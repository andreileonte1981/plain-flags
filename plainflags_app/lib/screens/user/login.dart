import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/user_storage.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/globals/capabilities.dart';
import 'package:plainflags_app/utils/emailcheck.dart';

import '../../globals/client.dart';

class Login extends ConsumerStatefulWidget {
  const Login({super.key});

  @override
  ConsumerState<Login> createState() => _LoginState();
}

class _LoginState extends ConsumerState<Login> {
  final _formGlobalKey = GlobalKey<FormState>();

  String _email = '';
  String _password = '';

  late TextEditingController _emailController;

  final FocusNode _passwordFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: _email);
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    try {
      final response = await Client.post('users/login', {
        'email': _email,
        'password': _password,
      }, null);

      if (response.statusCode == 200) {
        // Handle successful login
        final data = response.body as Map<String, dynamic>;

        final email = data['user']?['email'] ?? '';
        final token = data['token'] ?? '';

        ref.read(userStatusNotifierProvider.notifier).setLoggedIn(email, token);

        if (mounted) {
          Navigator.pop(context, email);
        }

        await UserStorage().save(email, _password);
      } else {
        // Handle error response
        final errorData = response.body as Map<String, dynamic>;
        final errorMessage = errorData['message'] ?? 'Signing in failed';
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
        ).showSnackBar(SnackBar(content: Text('Signing in failed')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              children: [
                Row(
                  children: [
                    Image.asset('assets/logo.png', width: 32, height: 32),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Log in to ${Client.apiUrlShort()}',
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Form(
                  key: _formGlobalKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(labelText: 'Email'),
                        keyboardType: TextInputType.emailAddress,
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
                      const SizedBox(height: 20),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Password',
                        ),
                        focusNode: _passwordFocusNode,
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
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () {
                          if (_formGlobalKey.currentState!.validate()) {
                            _formGlobalKey.currentState!.save();

                            _signIn();
                          }
                        },
                        child: const Text('Log In'),
                      ),
                      const SizedBox(height: 20),
                      Capabilities.disableUserRegistration
                          ? const SizedBox.shrink()
                          : ElevatedButton(
                              onPressed: () async {
                                final registerResult =
                                    await Navigator.pushNamed(
                                      context,
                                      '/register',
                                    );

                                if (registerResult != null) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          'Successfully signed up! Please sign in with your new account',
                                        ),
                                      ),
                                    );
                                  }
                                  if (registerResult is String) {
                                    if (context.mounted) {
                                      setState(() {
                                        _email = registerResult;
                                        _emailController.text = registerResult;

                                        if (context.mounted) {
                                          FocusScope.of(
                                            context,
                                          ).requestFocus(_passwordFocusNode);
                                        }
                                      });
                                    }
                                  }
                                }
                              },
                              child: const Text("Register"),
                            ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
