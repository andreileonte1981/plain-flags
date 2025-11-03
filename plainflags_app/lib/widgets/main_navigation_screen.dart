import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/globals/user_storage.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/connect.dart';
import 'package:plainflags_app/screens/flags/flags.dart';
import 'package:plainflags_app/screens/constraints/constraints.dart';
import 'package:plainflags_app/screens/user/login.dart';
import 'package:plainflags_app/screens/user/me.dart';

class MainNavigationScreen extends ConsumerStatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  ConsumerState<MainNavigationScreen> createState() =>
      _MainNavigationScreenState();
}

class _MainNavigationScreenState extends ConsumerState<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [const Flags(), const Constraints()];

  @override
  void initState() {
    super.initState();

    final apiUrlOk = checkExistingApiUrl();

    if (apiUrlOk) {
      checkExistingUser();
    }
  }

  Future<void> checkExistingUser() async {
    if (UserStorage.email == null || UserStorage.password == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        // Push modal login screen
        showLoginScreen();
      });
      return;
    }

    try {
      final response = await Client.post('users/login', {
        'email': UserStorage.email,
        'password': UserStorage.password,
      }, null);

      if (response.statusCode == 200) {
        // Handle successful login
        final data = response.body as Map<String, dynamic>;

        final email = data['user']?['email'] ?? '';
        final token = data['token'] ?? '';

        ref.read(userStatusNotifierProvider.notifier).setLoggedIn(email, token);

        if (mounted) setState(() {});
      } else {
        throw Exception('Failed to authenticate user');
      }
    } catch (e) {
      if (mounted) setState(() {});
    }
  }

  void showLoginScreen() {
    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const Login()),
      );
    }
  }

  bool checkExistingApiUrl() {
    if (Client.apiUrl().isEmpty) {
      // Defer navigation until after the current build cycle completes
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showConnectScreen();
      });
      return false;
    }
    return true;
  }

  Future<void> showConnectScreen() async {
    if (mounted) {
      final connectResult = await Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const Connect()),
      );

      if (connectResult == true) {
        // Connection successful, refresh the screen
        if (mounted) {
          setState(() {
            // This will trigger a rebuild of the widget
            checkExistingUser();
          });
        }
      }
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

    ref.read(userStatusNotifierProvider.notifier).setLoggedOut();
    await UserStorage.clear();

    setState(() {
      showConnectScreen();
    });
  }

  @override
  Widget build(BuildContext context) {
    final apiUrl = Client.apiUrlShort();
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              Image.asset('assets/logo.png', height: 32),
              const SizedBox(width: 8),
              Text(
                apiUrl.isEmpty ? 'Not Connected' : apiUrl,
                style: TextStyle(fontSize: 12),
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.link_off),
              onPressed: confirmDisconnect,
            ),
            IconButton(
              icon: const Icon(Icons.account_circle),
              onPressed: () async {
                final currentEmail = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const Me()),
                );
                if (currentEmail != null && currentEmail.isEmpty) {
                  showLoginScreen();
                }
              },
            ),
          ],
        ),
        body: _screens[_currentIndex],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.flag, color: Color.fromARGB(255, 0, 63, 52)),
              activeIcon: Icon(
                Icons.flag,
                color: Color.fromARGB(255, 0, 147, 122),
              ),
              label: 'Flags',
            ),
            BottomNavigationBarItem(
              icon: Icon(
                Icons.front_hand,
                color: Color.fromARGB(255, 110, 0, 124),
              ),
              activeIcon: Icon(
                Icons.front_hand,
                color: Color.fromARGB(255, 173, 0, 196),
              ),
              label: 'Constraints',
            ),
          ],
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
        ),
      ),
    );
  }
}
