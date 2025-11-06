import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/dlog.dart';

class CreateConstraintPanel extends ConsumerStatefulWidget {
  final Function() hideCreationPanel;
  final Function() fetchConstraints;

  const CreateConstraintPanel({
    super.key,
    required this.hideCreationPanel,
    required this.fetchConstraints,
  });

  @override
  ConsumerState<CreateConstraintPanel> createState() =>
      _CreateConstraintPanelState();
}

class _CreateConstraintPanelState extends ConsumerState<CreateConstraintPanel> {
  String newConstraintDescription = '';
  String newConstraintKey = '';
  String newConstraintValues = '';

  Future<void> create() async {
    if (newConstraintDescription.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Constraint description cannot be empty'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    if (newConstraintKey.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Constraint key cannot be empty'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    if (newConstraintValues.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Constraint values cannot be empty'),
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
            content: Text('Create new constraint "$newConstraintDescription"?'),
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
      final createResponse = await Client.post('constraints', {
        'description': newConstraintDescription,
        'key': newConstraintKey,
        'commaSeparatedValues': newConstraintValues,
      }, userStatus.token);

      if (createResponse.statusCode == 201) {
        dlog('Constraint created successfully');

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Constraint created'),
              backgroundColor: Colors.green,
            ),
          );
        }

        setState(() {
          widget.hideCreationPanel();
          newConstraintDescription = '';
          newConstraintKey = '';
          newConstraintValues = '';
        });

        widget.fetchConstraints();
      } else {
        dlog('Failed to create constraint: ${createResponse.statusCode}');

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
            createResponse.body['message'] ?? 'Failed to create constraint',
          );
        }
      }
    } catch (e) {
      dlog('Error creating constraint: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create constraint'),
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
          color: const Color.fromARGB(255, 151, 0, 139),
          width: 2.0,
        ),
      ),
      color: const Color.fromARGB(255, 255, 223, 255),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Flexible(
              child: Column(
                children: [
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Description',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      if (mounted) {
                        setState(() {
                          newConstraintDescription = value;
                        });
                      }
                    },
                  ),
                  SizedBox(height: 8),
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Key',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      if (mounted) {
                        setState(() {
                          newConstraintKey = value;
                        });
                      }
                    },
                  ),
                  SizedBox(height: 8),
                  TextField(
                    minLines: 2,
                    maxLines: null,
                    keyboardType: TextInputType.multiline,
                    decoration: InputDecoration(
                      labelText: 'Values (comma separated)',
                      hintText: 'value1, value2, value3',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      if (mounted) {
                        setState(() {
                          newConstraintValues = value;
                        });
                      }
                    },
                  ),
                ],
              ),
            ),
            Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  onPressed: () {
                    widget.hideCreationPanel();
                  },
                  icon: Icon(Icons.cancel),
                ),
                IconButton(
                  icon: Icon(Icons.add_circle),
                  onPressed: () {
                    create();
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
