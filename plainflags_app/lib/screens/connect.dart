import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:plainflags_app/utils/client.dart';

class Connect extends StatefulWidget {
  const Connect({super.key});

  @override
  State<Connect> createState() => _ConnectState();
}

class _ConnectState extends State<Connect> {
  final TextEditingController _apiUrlController = TextEditingController();
  final TextEditingController _passkeyController = TextEditingController();

  final _formGlobalKey = GlobalKey<FormState>();

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

  void authenticate(String passkey) async {
    try {
      final authResponse = await Client.post("dashauth", {
        'passkey': passkey,
      }, null);
      if (authResponse.statusCode == 200) {
        final FlutterSecureStorage storage = const FlutterSecureStorage();

        storage.write(key: 'api_url', value: Client.apiUrl());

        if (mounted) Navigator.pop(context, true);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Connected to Plain Flags service'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                authResponse.body['message'] ?? 'Authentication failed',
              ),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Connection failed: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _handleConnect() {
    final apiUrl = _apiUrlController.text.trim();

    Client.setBaseUrl('$apiUrl/api');

    authenticate(_passkeyController.text.trim());
  }

  void _handleDemo() {
    Client.setBaseUrl('https://demoservice.plainflags.dev/api');

    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        // resizeToAvoidBottomInset: false,
        body: SingleChildScrollView(
          child: Form(
            key: _formGlobalKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextFormField(
                    controller: _apiUrlController,
                    decoration: const InputDecoration(
                      labelText: 'API URL',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the API URL';
                      }
                      final uri = Uri.tryParse(value);
                      if (uri == null || !uri.isAbsolute) {
                        return 'Please enter a valid URL';
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextFormField(
                    controller: _passkeyController,
                    decoration: const InputDecoration(
                      labelText: 'Passkey',
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                    validator: (value) => value == null || value.isEmpty
                        ? 'Please enter the Passkey'
                        : null,
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (_formGlobalKey.currentState!.validate()) {
                      _formGlobalKey.currentState!.save();
                      _handleConnect();
                    }
                  },
                  child: const Text('Connect'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _handleDemo,
                  child: const Text('Demo'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
