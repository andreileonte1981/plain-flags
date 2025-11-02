import 'package:flutter/material.dart';
import 'package:plainflags_app/screens/connect.dart';
import 'package:plainflags_app/utils/client.dart';

class Flags extends StatefulWidget {
  const Flags({super.key});

  @override
  State<Flags> createState() => _FlagsState();
}

class _FlagsState extends State<Flags> {
  @override
  void initState() {
    super.initState();

    if (Client.apiUrl().isEmpty) {
      // Defer navigation until after the current build cycle completes
      WidgetsBinding.instance.addPostFrameCallback((_) {
        connect();
      });
    }
  }

  Future<void> connect() async {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flags')),
      body: const Center(child: Text('Flags')),
    );
  }
}
