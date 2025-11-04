import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/constraint.dart';

class ConstraintCard extends ConsumerStatefulWidget {
  final Constraint constraint;
  final VoidCallback updateConstraints;

  const ConstraintCard({
    super.key,
    required this.constraint,
    required this.updateConstraints,
  });

  @override
  ConsumerState<ConstraintCard> createState() => _ConstraintCardState();
}

class _ConstraintCardState extends ConsumerState<ConstraintCard> {
  @override
  Widget build(BuildContext context) {
    final constraint = widget.constraint;
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(8.0)),
        side: BorderSide(color: Color.fromARGB(255, 255, 193, 247), width: 2),
      ),
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Text(constraint.description),
      ),
    );
  }
}
