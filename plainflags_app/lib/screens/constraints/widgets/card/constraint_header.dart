import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/constraint.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';

class ConstraintHeader extends ConsumerStatefulWidget {
  final Constraint constraint;
  final VoidCallback updateConstraints;

  const ConstraintHeader({
    super.key,
    required this.constraint,
    required this.updateConstraints,
  });

  @override
  ConsumerState<ConstraintHeader> createState() => _ConstraintHeaderState();
}

class _ConstraintHeaderState extends ConsumerState<ConstraintHeader> {
  bool deletingConstraint = false;

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

  @override
  Widget build(BuildContext context) {
    final constraint = widget.constraint;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Icon(Icons.front_hand, color: Color.fromARGB(255, 136, 136, 136)),
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
    );
  }
}
