import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/dlog.dart';

class CreateConstraintPanel extends ConsumerStatefulWidget {
  final Function() hideCreationPanel;
  final Function() fetchConstraints;
  final Function() scrollToLastConstraint;

  const CreateConstraintPanel({
    super.key,
    required this.hideCreationPanel,
    required this.fetchConstraints,
    required this.scrollToLastConstraint,
  });

  @override
  ConsumerState<CreateConstraintPanel> createState() =>
      _CreateConstraintPanelState();
}

class _CreateConstraintPanelState extends ConsumerState<CreateConstraintPanel> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _keyController = TextEditingController();
  final _valuesController = TextEditingController();

  @override
  void dispose() {
    _descriptionController.dispose();
    _keyController.dispose();
    _valuesController.dispose();
    super.dispose();
  }

  String? _validateDescription(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Description cannot be empty';
    }
    return null;
  }

  String? _validateKey(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Key cannot be empty';
    }
    return null;
  }

  String? _validateValues(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Values cannot be empty';
    }

    final valuesList = value
        .split(',')
        .map((v) => v.trim())
        .where((v) => v.isNotEmpty)
        .toList();

    if (valuesList.isEmpty) {
      return 'Please provide at least one valid value';
    }

    return null;
  }

  Future<void> create() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final description = _descriptionController.text.trim();
    final key = _keyController.text.trim();
    final values = _valuesController.text.trim();

    // Ask confirmation
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Confirm Create'),
            content: Text('Create new constraint "$description"?'),
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
        'description': description,
        'key': key,
        'commaSeparatedValues': values,
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

        // Clear the form
        _descriptionController.clear();
        _keyController.clear();
        _valuesController.clear();

        widget.hideCreationPanel();
        widget.fetchConstraints();
        widget.scrollToLastConstraint();
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
        child: Form(
          key: _formKey,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Flexible(
                child: Column(
                  children: [
                    TextFormField(
                      autofocus: true,
                      controller: _descriptionController,
                      validator: _validateDescription,
                      decoration: InputDecoration(
                        labelText: 'Description',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(),
                        errorMaxLines: 2,
                      ),
                    ),
                    SizedBox(height: 8),
                    TextFormField(
                      controller: _keyController,
                      validator: _validateKey,
                      decoration: InputDecoration(
                        labelText: 'Key',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(),
                        errorMaxLines: 2,
                      ),
                    ),
                    SizedBox(height: 8),
                    TextFormField(
                      controller: _valuesController,
                      validator: _validateValues,
                      minLines: 2,
                      maxLines: null,
                      keyboardType: TextInputType.multiline,
                      decoration: InputDecoration(
                        labelText: 'Values (comma separated)',
                        hintText: 'value1, value2, value3',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(),
                        errorMaxLines: 2,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.start,
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
      ),
    );
  }
}
