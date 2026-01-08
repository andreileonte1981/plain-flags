import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/globals/connections.dart';
import 'package:plainflags_app/globals/user_storage.dart';
import 'package:plainflags_app/providers/navigation.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/emailcheck.dart';

class Login extends ConsumerStatefulWidget {
  final String userEmail;
  final String userPassword;
  const Login({super.key, required this.userEmail, required this.userPassword});

  @override
  ConsumerState<Login> createState() => _LoginState();
}

class _LoginState extends ConsumerState<Login> {
  final _formGlobalKey = GlobalKey<FormState>();

  late TextEditingController _emailController;
  late TextEditingController _passwordController;

  final FocusNode _passwordFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.userEmail);
    _passwordController = TextEditingController(text: widget.userPassword);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    try {
      final response = await Client.post('users/login', {
        'email': _emailController.text.trim(),
        'password': _passwordController.text.trim(),
      }, null);

      if (response.statusCode == 200) {
        // Handle successful login
        final data = response.body as Map<String, dynamic>;

        final email = data['user']?['email'] ?? '';
        final token = data['token'] ?? '';
        final role = data['user']?['role'] ?? '';

        ref
            .read(userStatusNotifierProvider.notifier)
            .setLoggedIn(email, token, role);

        ref.read(navigationProvider.notifier).updateToRole(role);

        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Welcome!')));
          Navigator.pop(context, email);
        }

        final connectionKey = Connections.currentConnectionKey;
        UserStorage.addCredentialsForConnection(
          connectionKey,
          email,
          _passwordController.text.trim(),
        );
        await UserStorage.save();
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
      final message =
          (e as dynamic).message ?? 'An error occurred during login.';

      showConnectionError(message);
    }
  }

  Future<void> showConnectionError(String message) async {
    if (mounted) {
      showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Login Failed'),
            content: Text(message),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text('OK'),
              ),
            ],
          );
        },
      );
    }
  }

  Future<void> confirmDisconnect() async {
    final confirm = await showDialog<bool?>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Disconnect', textAlign: TextAlign.center),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Divider(height: 4, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 20),
              Text(
                'Disconnect from ${Client.apiUrlShort()}?',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Divider(height: 4, color: Theme.of(context).colorScheme.primary),
            ],
          ),
          actions: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context, false);
                  },
                  child: const Text('Stay'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(context, true);
                  },
                  child: const Text('Disconnect'),
                ),
              ],
            ),
          ],
        );
      },
    );

    if (confirm != true) {
      return;
    }

    Client.clearBaseUrl();

    if (mounted) {
      setState(() {
        Navigator.pop(context, "");
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          actions: [
            IconButton(
              icon: const Icon(Icons.link_off),
              onPressed: confirmDisconnect,
            ),
          ],
          title: Row(
            children: [
              Image.asset('assets/logo.png', width: 32, height: 32),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Log in to ${Client.apiUrlShort()}',
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12),
                ),
              ),
            ],
          ),
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              children: [
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
                          _emailController.text = value ?? '';
                        },
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Password',
                        ),
                        focusNode: _passwordFocusNode,
                        controller: _passwordController,
                        obscureText: true,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your password';
                          }
                          return null;
                        },
                        onSaved: (value) {
                          _passwordController.text = value ?? '';
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
