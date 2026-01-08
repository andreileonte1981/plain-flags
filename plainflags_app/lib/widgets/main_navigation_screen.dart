import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/globals/connections.dart';
import 'package:plainflags_app/globals/events.dart';
import 'package:plainflags_app/globals/user_storage.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/providers/navigation.dart';
import 'package:plainflags_app/screens/connect.dart';
import 'package:plainflags_app/screens/flags/archived.dart';
import 'package:plainflags_app/screens/flags/flags.dart';
import 'package:plainflags_app/screens/constraints/constraints.dart';
import 'package:plainflags_app/screens/user/login.dart';
import 'package:plainflags_app/screens/user/me.dart';
import 'package:plainflags_app/screens/users/users.dart';
import 'package:plainflags_app/utils/dlog.dart';
import 'package:url_launcher/url_launcher.dart';

class MainNavigationScreen extends ConsumerStatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  ConsumerState<MainNavigationScreen> createState() =>
      _MainNavigationScreenState();
}

class _MainNavigationScreenState extends ConsumerState<MainNavigationScreen> {
  final List<Widget> _screens = [
    const Flags(),
    const Constraints(),
    const Archived(),
    const Users(),
  ];

  @override
  void initState() {
    super.initState();

    Events.register((Event e) {
      if (e.name == 'user_login') {
        if (mounted) setState(() {});
      }
    });

    final apiUrlOk = checkExistingConnection();

    if (apiUrlOk) {
      checkExistingUser();
    }
  }

  Future<void> checkExistingUser() async {
    final connectionUrl = Connections.currentConnectionKey;
    final creds = UserStorage.credentialsForConnection(connectionUrl);
    if (creds == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showLoginScreen('', '');
      });
      return;
    }

    try {
      final response = await Client.post('users/login', {
        'email': creds.email,
        'password': creds.password,
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

        Events.fire(Event(name: 'user_login'));

        if (mounted) setState(() {});
      } else {
        throw Exception('Failed to authenticate user');
      }
    } catch (e) {
      final message =
          (e as dynamic).message ?? 'An error occurred during login.';

      showConnectionError(message, creds.email, creds.password);
    }
  }

  Future<void> showConnectionError(
    String message,
    String email,
    String password,
  ) async {
    if (mounted) {
      await showDialog(
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

    if (mounted) {
      showLoginScreen(email, password);
    }
  }

  Future<void> showLoginScreen(String email, String password) async {
    if (mounted) {
      final String loginEmail =
          (await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  Login(userEmail: email, userPassword: password),
            ),
          )) ??
          '';

      if (loginEmail.isEmpty) {
        showConnectScreen();
      } else {
        Events.fire(Event(name: 'user_login'));
      }
    }
  }

  bool checkExistingConnection() {
    if (Connections.currentConnectionKey.isEmpty) {
      // Defer navigation until after the current build cycle completes
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showConnectScreen();
      });
      return false;
    }

    Client.setBaseUrl('${Connections.currentConnectionKey}/api');

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
                'Disconnect from ${Connections.isDemo() ? "demo service" : Client.apiUrlShort()}?',
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

    setState(() {
      showConnectScreen();
    });
  }

  Future<void> showDemoModal() async {
    if (mounted) {
      await showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Demo Connection'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(height: 20),
                Flexible(
                  child: const Text(
                    'The demo connection of Plain Flags controls the pixels of an image in the demo application.',
                    softWrap: true,
                    overflow: TextOverflow.visible,
                  ),
                ),
                const SizedBox(height: 20),
                Flexible(
                  child: Text(
                    'Demo users can create and toggle pixels within bounds using feature flags named "pixel-x-y".',
                    softWrap: true,
                    overflow: TextOverflow.visible,
                  ),
                ),
                SizedBox(height: 16),
                Text('Controlled Application:'),
                TextButton(
                  onPressed: () async {
                    if (!await launchUrl(
                      Uri.parse('https://demoapp.plainflags.dev'),
                    )) {
                      dlog('Could not launch demo application URL');
                    }
                  },
                  child: Text('https://demoapp.plainflags.dev'),
                ),
                SizedBox(height: 16),
                Text('Plain Flags Homepage:'),
                TextButton(
                  onPressed: () async {
                    if (!await launchUrl(Uri.parse('https://plainflags.dev'))) {
                      dlog('Could not launch Plain Flags homepage URL');
                    }
                  },
                  child: Text('https://plainflags.dev'),
                ),
              ],
            ),
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

  @override
  Widget build(BuildContext context) {
    final apiUrl = Client.apiUrlShort();
    final currentIndex = ref.watch(navigationProvider);

    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              Image.asset('assets/logo.png', height: 32),
              const SizedBox(width: 8),
              apiUrl.isEmpty
                  ? Text(
                      'Not Connected',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color.fromARGB(255, 200, 0, 0),
                      ),
                    )
                  : apiUrl ==
                        Connections.demoConnection
                            .replaceAll('http://', '')
                            .replaceAll('https://', '')
                  ? Row(
                      children: [
                        Text(
                          "DEMO",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.green[700],
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            showDemoModal();
                          },
                          icon: Icon(Icons.info, color: Colors.green[700]),
                        ),
                      ],
                    )
                  : Text(apiUrl, style: TextStyle(fontSize: 12)),
            ],
          ),
          actions: [
            apiUrl.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.link_off),
                    onPressed: confirmDisconnect,
                  )
                : IconButton(
                    onPressed: showConnectScreen,
                    icon: Icon(Icons.leak_add),
                  ),
            IconButton(
              icon: const Icon(Icons.account_circle),
              onPressed: () async {
                final currentEmail = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const Me()),
                );
                if (currentEmail != null && currentEmail.isEmpty) {
                  showLoginScreen('', '');
                }
              },
            ),
          ],
        ),
        body: _screens[currentIndex],
        bottomNavigationBar: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          currentIndex: currentIndex,
          items: [
            BottomNavigationBarItem(
              icon: Icon(Icons.flag, color: Color.fromARGB(255, 0, 58, 48)),
              activeIcon: Icon(
                Icons.flag,
                color: Color.fromARGB(255, 0, 158, 132),
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

            if ([
              Role.admin,
              Role.superadmin,
            ].contains(ref.read(userStatusNotifierProvider).role))
              BottomNavigationBarItem(
                icon: Icon(Icons.delete, color: Color.fromARGB(255, 53, 0, 0)),
                activeIcon: Icon(
                  Icons.delete,
                  color: Color.fromARGB(255, 156, 0, 0),
                ),
                label: 'Archived Flags',
              ),

            if ([
              Role.admin,
              Role.superadmin,
            ].contains(ref.read(userStatusNotifierProvider).role))
              BottomNavigationBarItem(
                icon: Icon(Icons.people, color: Color.fromARGB(255, 0, 27, 85)),
                activeIcon: Icon(
                  Icons.people,
                  color: Color.fromARGB(255, 11, 0, 172),
                ),
                label: 'Users',
              ),
          ],
          onTap: (index) {
            ref.read(navigationProvider.notifier).setIndex(index);
          },
        ),
      ),
    );
  }
}
