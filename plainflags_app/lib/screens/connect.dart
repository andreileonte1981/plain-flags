import 'package:flutter/material.dart';
import 'package:plainflags_app/globals/capabilities.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/globals/connections.dart';
import 'package:plainflags_app/utils/dlog.dart';

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

    _apiUrlController.text = Connections.currentConectionKey;
  }

  @override
  void dispose() {
    _apiUrlController.dispose();
    _passkeyController.dispose();
    super.dispose();
  }

  Future<void> authenticate(String passkey) async {
    try {
      final authResponse = await Client.post("dashauth", {
        'passkey': passkey,
      }, null);
      if (authResponse.statusCode == 200) {
        Connections.add(Client.apiUrlBase(), passkey);
        Connections.select(Client.apiUrlBase());
        Connections.save();

        dlog('Auth response: ${authResponse.body}');

        Capabilities.setDisableUserRegistration(
          authResponse.body['disableUserRegistration'] ?? false,
        );

        Capabilities.save();

        if (mounted) Navigator.pop(context, true);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Connected to Plain Flags service at "${Client.apiUrlShort()}"',
              ),
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

  Future<void> forgetConnection(String apiUrl) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Forget Connection'),
          content: Text(
            'Are you sure you want to forget the connection to "$apiUrl"?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Forget'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      Connections.forget(apiUrl);
      await Connections.save();
      setState(() {});
    }
  }

  Future<void> confirmConnection(String apiUrl) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirm Connection'),
          content: Text('Connect to the service at "$apiUrl"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Connect'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      Connections.select(apiUrl);
      Connections.save();

      Client.setBaseUrl('$apiUrl/api');
      final passkey = Connections.connections[apiUrl] ?? '';
      authenticate(passkey);
    }
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
                Divider(height: 32),
                ElevatedButton(
                  onPressed: _handleDemo,
                  child: const Text('Demo'),
                ),
                Divider(height: 32),
                Column(
                  children: [
                    ListView.builder(
                      shrinkWrap: true,
                      itemCount: Connections.connections.keys.length,
                      itemBuilder: (context, index) {
                        final apiUrl = Connections.connections.keys.elementAt(
                          index,
                        );
                        return Card(
                          shape: RoundedRectangleBorder(
                            side: BorderSide(
                              color: const Color.fromARGB(255, 0, 139, 105),
                              width: 2.0,
                            ),
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    apiUrl,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete),
                                  onPressed: () {
                                    forgetConnection(apiUrl);
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.leak_add),
                                  onPressed: () {
                                    confirmConnection(apiUrl);
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
