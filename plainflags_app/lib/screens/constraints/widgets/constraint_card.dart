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
    bool editingValues = false;

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
                IconButton(onPressed: () {}, icon: Icon(Icons.delete)),
              ],
            ),
            Divider(),
            Text('For: ${constraint.key}'),
            Text('Named:'),
            editingValues
                ? Row(children: [])
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
                            onPressed: () {},
                            icon: Icon(Icons.edit),
                          ),
                        ),
                      ],
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
