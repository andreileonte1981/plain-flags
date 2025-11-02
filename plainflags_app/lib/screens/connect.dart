import 'package:flutter/material.dart';
import 'package:plainflags_app/utils/client.dart';

class Connect extends StatefulWidget {
  const Connect({super.key});

  @override
  State<Connect> createState() => _ConnectState();
}

class _ConnectState extends State<Connect> {
  final TextEditingController _apiUrlController = TextEditingController();
  final TextEditingController _passkeyController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Pre-fill with existing API URL if available
    _apiUrlController.text = Client.apiUrl();
  }

  @override
  void dispose() {
    _apiUrlController.dispose();
    _passkeyController.dispose();
    super.dispose();
  }

  void authenticateWithPasskey(String passkey) async {
    final authResponse = await Client.post("dashauth", {
      'passkey': passkey,
    }, null);
    if (authResponse.statusCode == 200) {
      if (mounted) Navigator.pop(context, true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Connected to Plain Flags service'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  void _handleConnect() {
    final apiUrl = _apiUrlController.text.trim();

    if (apiUrl.isNotEmpty) {
      Client.setBaseUrl('$apiUrl/api');

      authenticateWithPasskey(_passkeyController.text.trim());
    } else {
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid API URL'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _handleDemo() {
    Client.setBaseUrl('https://demoservice.plainflags.dev/api');

    // TODO: make demo request to get a user token

    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Plain Flags Home')),
      body: Center(
        // Form for entering API URL and passkey and a demo button
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _apiUrlController,
                decoration: const InputDecoration(
                  labelText: 'API URL',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _passkeyController,
                decoration: const InputDecoration(
                  labelText: 'Passkey',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            ElevatedButton(
              onPressed: _handleConnect,
              child: const Text('Connect'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _handleDemo, child: const Text('Demo')),
          ],
        ),
      ),
    );
  }
}
