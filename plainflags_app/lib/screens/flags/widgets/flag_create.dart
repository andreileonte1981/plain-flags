import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/dlog.dart';

class CreateFlagPanel extends ConsumerStatefulWidget {
  final Function() hideCreationPanel;
  final Function() fetchFlags;

  const CreateFlagPanel({
    super.key,
    required this.hideCreationPanel,
    required this.fetchFlags,
  });

  @override
  ConsumerState<CreateFlagPanel> createState() => _CreateFlagPanelState();
}

class _CreateFlagPanelState extends ConsumerState<CreateFlagPanel> {
  String newFlagName = '';

  Future<void> create() async {
    if (newFlagName.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Flag name cannot be empty'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    // Ask confirmation
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Confirm Create'),
            content: Text('Create new flag "$newFlagName"?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Create'),
              ),
            ],
          ),
        ) ??
        false;

    if (!confirmed) return;

    try {
      final userStatus = ref.read(userStatusNotifierProvider);
      final createResponse = await Client.post('flags', {
        'name': newFlagName,
      }, userStatus.token);

      if (createResponse.statusCode == 201) {
        dlog('Flag created successfully');

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Flag created'),
              backgroundColor: Colors.green,
            ),
          );
        }

        setState(() {
          widget.hideCreationPanel();
          newFlagName = '';
        });

        widget.fetchFlags();
      } else {
        dlog('Failed to create flag: ${createResponse.statusCode}');

        if (createResponse.body['message'] != null) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(createResponse.body['message']),
                backgroundColor: Colors.red,
              ),
            );
          }
        } else {
          throw Exception(
            createResponse.body['message'] ?? 'Failed to create flag',
          );
        }
      }
    } catch (e) {
      dlog('Error creating flag: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create flag'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        side: BorderSide(
          color: const Color.fromARGB(255, 0, 139, 105),
          width: 2.0,
        ),
      ),
      color: const Color.fromARGB(255, 189, 255, 239),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            TextField(
              autofocus: true,
              decoration: InputDecoration(
                labelText: 'New flag name',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(Icons.add_circle),
                  onPressed: () {
                    create();
                  },
                ),
              ),
              onChanged: (value) {
                if (mounted) {
                  setState(() {
                    newFlagName = value;
                  });
                }
              },
            ),
            IconButton(
              onPressed: () {
                setState(() {
                  widget.hideCreationPanel();
                });
              },
              icon: Icon(Icons.cancel),
            ),
          ],
        ),
      ),
    );
  }
}
