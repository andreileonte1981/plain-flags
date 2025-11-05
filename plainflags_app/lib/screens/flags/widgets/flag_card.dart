import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_badges.dart';
import 'package:plainflags_app/utils/dlog.dart';

class FlagCard extends ConsumerStatefulWidget {
  final Flag flag;
  final Future<void> Function() updateFlags;

  const FlagCard({super.key, required this.flag, required this.updateFlags});

  @override
  ConsumerState<FlagCard> createState() => _FlagCardState();
}

class _FlagCardState extends ConsumerState<FlagCard> {
  bool archiving = false;

  bool mayDelete() {
    return widget.flag.isOn == false;
  }

  Future<void> archive(Flag flag) async {
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Confirm Archive'),
            content: Text('Archive flag ${flag.name}?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Archive'),
              ),
            ],
          ),
        ) ??
        false;

    if (!confirmed) return;

    try {
      setState(() {
        archiving = true;
      });

      final userStatus = ref.read(userStatusNotifierProvider);
      final archiveResponse = await Client.post('flags/archive', {
        'id': flag.id,
      }, userStatus.token);

      if (archiveResponse.statusCode == 200) {
        dlog('Flag archived successfully');

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Flag archived'),
              backgroundColor: Colors.green,
            ),
          );
        }

        widget.updateFlags();
      } else {
        dlog('Failed to archive flag: ${archiveResponse.statusCode}');

        throw Exception('Failed to archive flag');
      }
    } catch (e) {
      dlog('Error archiving flag: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to archive flag'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          archiving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final flag = widget.flag;

    return Card(
      shape: RoundedRectangleBorder(
        side: BorderSide(
          color: const Color.fromARGB(255, 0, 139, 105),
          width: 2.0,
        ),
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            Row(
              children: [
                Icon(Icons.flag, color: const Color.fromARGB(255, 71, 71, 71)),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    widget.flag.name,
                    softWrap: true,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color.fromARGB(255, 71, 71, 71),
                    ),
                  ),
                ),
              ],
            ),
            Divider(height: 4, color: const Color.fromARGB(255, 219, 219, 219)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                FlagBadges(flag: flag),

                archiving
                    ? CircularProgressIndicator()
                    : IconButton(
                        onPressed: mayDelete()
                            ? () {
                                archive(flag);
                              }
                            : null,
                        icon: Icon(Icons.delete),
                      ),
              ],
            ),
            if (flag.constraints.isNotEmpty)
              Divider(
                height: 4,
                color: const Color.fromARGB(255, 219, 219, 219),
              ),
            if (flag.constraints.isNotEmpty)
              IgnorePointer(
                ignoring: true,
                child: Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                    side: BorderSide(
                      color: const Color.fromARGB(255, 255, 167, 240),
                      width: 1.0,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      children: [
                        ListView.builder(
                          shrinkWrap: true,
                          itemCount: flag.constraints.length,
                          itemBuilder: (context, index) {
                            final constraint = flag.constraints[index];
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.front_hand,
                                      color: Color.fromARGB(255, 145, 0, 125),
                                      size: 16,
                                    ),
                                    SizedBox(width: 8),
                                    Flexible(
                                      child: Text(
                                        constraint.description,
                                        softWrap: true,
                                        style: TextStyle(
                                          color: Color.fromARGB(
                                            255,
                                            145,
                                            0,
                                            125,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Text('For: ${constraint.key}'),
                                Text('Named: ${constraint.values.join(', ')}'),
                                if (index < flag.constraints.length - 1)
                                  Divider(
                                    height: 4,
                                    color: const Color.fromARGB(
                                      255,
                                      219,
                                      219,
                                      219,
                                    ),
                                  ),
                              ],
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
