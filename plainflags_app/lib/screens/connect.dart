import 'package:flutter/material.dart';
import 'package:plainflags_app/globals/capabilities.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/globals/connections.dart';
import 'package:plainflags_app/globals/user_storage.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/utils/dlog.dart';

class Connect extends ConsumerStatefulWidget {
  const Connect({super.key});

  @override
  ConsumerState<Connect> createState() => _ConnectState();
}

class _ConnectState extends ConsumerState<Connect> {
  final TextEditingController _apiUrlController = TextEditingController();
  final TextEditingController _passkeyController = TextEditingController();

  final _formGlobalKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();

    _apiUrlController.text = Connections.isDemo()
        ? ""
        : Connections.currentConnectionKey;
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
        // Modal dialog
        showDialog(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('Connection Error'),
              content: const Text(
                'Failed to connect. Make sure your device is online and the remote service is up.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('OK'),
                ),
              ],
            );
          },
        );
      }
    }
  }

  void handleConnect() {
    final apiUrl = _apiUrlController.text.trim();

    Client.setBaseUrl('$apiUrl/api');

    authenticate(_passkeyController.text.trim());
  }

  Future<void> handleDemo() async {
    Client.setBaseUrl('${Connections.demoConnection}/api');

    // Check if there's a demo user already
    final demoCreds = UserStorage.credentialsForConnection(
      Connections.demoConnection,
    );

    if (demoCreds != null) {
      dlog('Using existing demo credentials');
      Connections.select(Connections.demoConnection);

      await Connections.save();

      if (mounted) Navigator.pop(context, true);

      return;
    }

    // Ask user for name
    final String name = await showDialog(
      context: context,
      builder: (context) {
        String nameValue = '';
        return AlertDialog(
          title: const Text('Enter Demo Name'),
          content: TextField(
            decoration: const InputDecoration(
              labelText: 'Your Name',
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              nameValue = value;
            },
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(""),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(nameValue),
              child: const Text('OK'),
            ),
          ],
        );
      },
    );

    if (name.isNotEmpty) {
      connectToDemo(name);
    }
  }

  Future<void> connectToDemo(String name) async {
    try {
      final response = await Client.post('dashauth/demo', {'name': name}, null);

      if (response.statusCode == 201) {
        String email = response.body['user']?['email'] ?? '';
        String tempPassword = response.body['user']?['tempPassword'] ?? '';
        String token = response.body['token'] ?? '';

        ref.read(userStatusNotifierProvider.notifier).setLoggedIn(email, token);

        UserStorage.addCredentialsForConnection(
          Connections.demoConnection,
          email,
          tempPassword,
        );

        await UserStorage.save();

        Connections.select(Connections.demoConnection);

        await Connections.save();

        if (mounted) Navigator.pop(context, true);
      } else {
        dlog(
          'Demo connection failed: ${response.statusCode} - ${response.body}',
        );
        throw Exception('Failed to connect to demo service');
      }
    } catch (e) {
      dlog('Error connecting to demo service: $e');
      if (mounted) {
        // Modal dialog
        showDialog(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('Connection Error'),
              content: const Text(
                'Failed to connect to demo service. Make sure your device is online.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('OK'),
                ),
              ],
            );
          },
        );
      }
    }
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
                      handleConnect();
                    }
                  },
                  child: const Text('Connect'),
                ),
                if (Connections.connections.isNotEmpty)
                  Column(
                    children: [
                      Divider(height: 32),

                      const Text(
                        'Previously Connected Services:',
                        style: TextStyle(fontSize: 12),
                      ),
                      SizedBox(height: 4),

                      ...Connections.connections.keys.map((apiUrl) {
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
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: TextButton(
                                    onPressed: () {
                                      confirmConnection(apiUrl);
                                    },
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      children: [
                                        const Icon(Icons.leak_add),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            apiUrl,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete),
                                  onPressed: () {
                                    forgetConnection(apiUrl);
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                Divider(height: 32),
                ElevatedButton(
                  onPressed: handleDemo,
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
