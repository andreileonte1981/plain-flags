import 'package:flutter/material.dart';
import 'package:plainflags_app/screens/connect.dart';
import 'package:plainflags_app/screens/flags/flags.dart';
import 'package:plainflags_app/screens/constraints/constraints.dart';
import 'package:plainflags_app/utils/client.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [const Flags(), const Constraints()];

  @override
  void initState() {
    super.initState();

    if (Client.apiUrl().isEmpty) {
      // Defer navigation until after the current build cycle completes
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showConnectScreen();
      });
    }
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

    Client.setBaseUrl('');
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
          title: Text(
            apiUrl.isEmpty ? 'Not Connected' : apiUrl,
            style: TextStyle(fontSize: 12),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.link_off),
              onPressed: confirmDisconnect,
            ),
          ],
        ),
        body: _screens[_currentIndex],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.flag), label: 'Flags'),
            BottomNavigationBarItem(
              icon: Icon(Icons.shield),
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
