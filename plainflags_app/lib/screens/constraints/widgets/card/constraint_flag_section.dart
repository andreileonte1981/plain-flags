import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/constraint.dart';
import 'package:plainflags_app/providers/current_flag_id.dart';
import 'package:plainflags_app/screens/flags/flag_details.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_badge.dart';

class ConstraintFlagSection extends ConsumerStatefulWidget {
  final Constraint constraint;
  final Function() updateConstraints;

  const ConstraintFlagSection({
    super.key,
    required this.constraint,
    required this.updateConstraints,
  });

  @override
  ConsumerState<ConstraintFlagSection> createState() =>
      _ConstraintFlagSectionState();
}

class _ConstraintFlagSectionState extends ConsumerState<ConstraintFlagSection> {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(right: 8.0, top: 4.0, bottom: 4.0),
      padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: Color.fromARGB(255, 224, 224, 224),
        borderRadius: BorderRadius.circular(2.0),
        border: Border.all(
          color: Color.fromARGB(255, 200, 200, 200),
          width: 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Flags constrained:',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          for (var flag in widget.constraint.flags)
            Padding(
              padding: const EdgeInsets.all(2.0),
              child: TextButton(
                onPressed: () async {
                  ref.read(currentFlagIdProvider.notifier).setFlagId(flag.id);
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => FlagDetails(flagId: flag.id),
                    ),
                  );
                  widget.updateConstraints();
                },
                child: Row(
                  children: [
                    Flexible(
                      child: Text(
                        flag.name,
                        style: TextStyle(
                          color: flag.isOn
                              ? Colors.green[800]
                              : Colors.grey[800],
                        ),
                        softWrap: true,
                        overflow: TextOverflow.visible,
                      ),
                    ),
                    SizedBox(width: 8),
                    flag.isOn
                        ? FlagBadge(
                            backgroundColor: const Color.fromARGB(
                              255,
                              206,
                              255,
                              207,
                            ),
                            strokeColor: const Color.fromARGB(
                              255,
                              134,
                              179,
                              135,
                            ),
                            child: Row(
                              children: [
                                Text(
                                  'on',
                                  style: TextStyle(
                                    color: Colors.green[800],
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                SizedBox(width: 4),
                                Icon(
                                  Icons.flag,
                                  color: Colors.green[800],
                                  size: 16,
                                ),
                              ],
                            ),
                          )
                        : FlagBadge(
                            backgroundColor: Colors.grey[400]!,
                            strokeColor: Colors.grey[600]!,
                            child: Row(
                              children: [
                                Text('off'),
                                SizedBox(width: 4),
                                Transform.rotate(
                                  angle: 1.2,
                                  child: Icon(
                                    Icons.flag_outlined,
                                    color: Colors.grey[800],
                                    size: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
