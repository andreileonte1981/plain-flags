import 'package:flutter/material.dart';
import 'package:plainflags_app/domain/constraint.dart';
import 'package:plainflags_app/domain/flag.dart';

class FlagConstraintSection extends StatelessWidget {
  final Iterable<Constraint> linkableConstraints;
  final Flag? flag;

  const FlagConstraintSection({
    super.key,
    required this.linkableConstraints,
    required this.flag,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpansionTile(
          title: Text('Linkable Constraints'),
          childrenPadding: EdgeInsets.only(bottom: 2),
          children: [
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: SizedBox(
                height: 300,
                child: ListView.builder(
                  itemCount: linkableConstraints.length,
                  itemBuilder: (context, index) {
                    final constraint = linkableConstraints.elementAt(index);
                    return Card(
                      shape: RoundedRectangleBorder(
                        side: BorderSide(
                          color: const Color.fromARGB(255, 255, 167, 240),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(4.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    constraint.description,
                                    softWrap: true,
                                    overflow: TextOverflow.visible,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text('For: ${constraint.key}'),
                                  Text('Named:'),
                                  Column(
                                    children: constraint.values
                                        .map((v) => Text(v))
                                        .toList(),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.link),
                              onPressed: () {
                                // Link constraint action
                              },
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
        ExpansionTile(
          title: Text('Applied Constraints'),
          childrenPadding: EdgeInsets.only(bottom: 2),
          initiallyExpanded: true,
          children: [
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: SizedBox(
                height: 300,
                child: ListView.builder(
                  itemCount: flag!.constraints.length,
                  itemBuilder: (context, index) {
                    final constraint = flag!.constraints[index];
                    return Card(
                      shape: RoundedRectangleBorder(
                        side: BorderSide(
                          color: const Color.fromARGB(255, 255, 167, 240),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(4.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    constraint.description,
                                    softWrap: true,
                                    overflow: TextOverflow.visible,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text('For: ${constraint.key}'),
                                  Text('Named:'),
                                  Column(
                                    children: constraint.values
                                        .map((v) => Text(v))
                                        .toList(),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.link_off),
                              onPressed: () {
                                // Unlink constraint action
                              },
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
