import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/constraint.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/constraints/widgets/constraint_flag_section.dart';

class ConstraintCard extends ConsumerStatefulWidget {
  final Constraint constraint;
  final VoidCallback updateConstraints;
  final Function() showFABs;
  final Function() hideFABs;

  const ConstraintCard({
    super.key,
    required this.constraint,
    required this.updateConstraints,
    required this.showFABs,
    required this.hideFABs,
  });

  @override
  ConsumerState<ConstraintCard> createState() => _ConstraintCardState();
}

class _ConstraintCardState extends ConsumerState<ConstraintCard> {
  bool editingValues = false;
  bool savingValues = false;
  bool deletingConstraint = false;

  bool checkValid(String newValues) {
    if (newValues.split(',').any((v) => v.trim().isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Comma separated values required'),
          backgroundColor: Colors.red,
        ),
      );
      return false;
    }
    return true;
  }

  bool mayDelete() {
    return widget.constraint.flags.any((flag) => flag.isOn) == false;
  }

  Future<void> deleteConstraint() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Delete constraint?',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) {
      return;
    }

    try {
      deletingConstraint = true;
      final deleteResponse = await Client.post("constraints/delete", {
        'id': widget.constraint.id,
      }, ref.read(userStatusNotifierProvider).token);

      if (deleteResponse.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Constraint deleted'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        throw Exception('Failed to delete constraint');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to delete constraint'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          deletingConstraint = false;
        });
      }
    }

    widget.updateConstraints();
  }

  Future<void> saveValues(String newValues) async {
    if (!checkValid(newValues)) {
      return;
    }

    // Ask user for confirmation
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Save values?', style: TextStyle(fontWeight: FontWeight.bold)),
            Divider(),
            Text('Value changes are recorded in flag history.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Save'),
          ),
        ],
      ),
    );

    if (confirmed != true) {
      return;
    }

    if (mounted) {
      setState(() {
        savingValues = true;
      });
    }

    try {
      await Client.post("constraints/values", {
        'id': widget.constraint.id,
        'values': newValues,
      }, ref.read(userStatusNotifierProvider).token);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save constraint values'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          savingValues = false;
        });
      }
    }

    setState(() {
      editingValues = false;
      widget.showFABs();
    });

    // Call the updateConstraints callback to notify parent widget
    widget.updateConstraints();
  }

  @override
  Widget build(BuildContext context) {
    String editedValues = widget.constraint.values.join(',\n');
    final constraint = widget.constraint;

    TextEditingController valuesController = TextEditingController(
      text: editedValues,
    );

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(8.0)),
        side: BorderSide(color: Color.fromARGB(255, 255, 193, 247), width: 2),
      ),
      color: Color.fromARGB(255, 255, 240, 251),
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(
                  Icons.front_hand,
                  color: Color.fromARGB(255, 136, 136, 136),
                ),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    constraint.description,
                    softWrap: true,
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                SizedBox(width: 8),
                deletingConstraint
                    ? CircularProgressIndicator()
                    : IconButton(
                        onPressed: mayDelete()
                            ? () {
                                deleteConstraint();
                              }
                            : null,
                        icon: Icon(Icons.delete),
                      ),
              ],
            ),
            Divider(),
            Text('For: ${constraint.key}'),
            Text('Named:'),
            editingValues == true
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            hintText: 'Enter values, comma separated',
                          ),
                          minLines: 3,
                          maxLines: null,
                          keyboardType: TextInputType.multiline,
                          controller: valuesController,
                          autofocus: true,
                        ),
                      ),
                      SizedBox(width: 8),
                      savingValues
                          ? CircularProgressIndicator()
                          : Column(
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    color: Color.fromARGB(255, 255, 255, 255),
                                    borderRadius: BorderRadius.circular(4.0),
                                    shape: BoxShape.rectangle,
                                    border: Border.all(
                                      color: Color.fromARGB(255, 50, 50, 50),
                                      width: 1.0,
                                    ),
                                  ),
                                  child: IconButton(
                                    onPressed: () {
                                      setState(() {
                                        editingValues = false;
                                        widget.showFABs();
                                      });
                                    },
                                    icon: Icon(Icons.highlight_off),
                                  ),
                                ),
                                SizedBox(height: 4),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Color.fromARGB(255, 255, 255, 255),
                                    borderRadius: BorderRadius.circular(4.0),
                                    shape: BoxShape.rectangle,
                                    border: Border.all(
                                      color: Color.fromARGB(255, 50, 50, 50),
                                      width: 1.0,
                                    ),
                                  ),
                                  child: IconButton(
                                    onPressed: () {
                                      saveValues(valuesController.text);
                                    },
                                    icon: Icon(Icons.cloud_upload),
                                  ),
                                ),
                              ],
                            ),
                    ],
                  )
                : Container(
                    margin: EdgeInsets.only(right: 8.0, top: 4.0, bottom: 4.0),
                    padding: EdgeInsets.symmetric(
                      horizontal: 8.0,
                      vertical: 4.0,
                    ),
                    decoration: BoxDecoration(
                      color: Color.fromARGB(255, 224, 224, 224),
                      borderRadius: BorderRadius.circular(2.0),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            for (var value in constraint.values) Text(value),
                          ],
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: Color.fromARGB(255, 255, 255, 255),
                            borderRadius: BorderRadius.circular(4.0),
                            shape: BoxShape.rectangle,
                            border: Border.all(
                              color: Color.fromARGB(255, 50, 50, 50),
                              width: 1.0,
                            ),
                          ),
                          child: IconButton(
                            onPressed: () {
                              setState(() {
                                editingValues = true;
                                widget.hideFABs();
                              });
                            },
                            icon: Icon(Icons.edit),
                          ),
                        ),
                      ],
                    ),
                  ),
            if (constraint.flags.isNotEmpty) Divider(),
            if (constraint.flags.isNotEmpty)
              ConstraintFlagSection(constraint: constraint),
          ],
        ),
      ),
    );
  }
}
