import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:animated_list_plus/animated_list_plus.dart';
import 'package:animated_list_plus/transitions.dart';
import 'package:plainflags_app/domain/constraint.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/dlog.dart';

class FlagConstraintSection extends ConsumerStatefulWidget {
  final Iterable<Constraint> linkableConstraints;
  final Flag flag;
  final Function() fetchFlagDetails;

  const FlagConstraintSection({
    super.key,
    required this.linkableConstraints,
    required this.flag,
    required this.fetchFlagDetails,
  });

  @override
  ConsumerState<FlagConstraintSection> createState() =>
      _FlagConstraintSectionState();
}

class _FlagConstraintSectionState extends ConsumerState<FlagConstraintSection> {
  bool unlinking = false;

  Future<void> linkConstraint(Constraint constraint) async {
    // Confirm link action
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Apply "${constraint.description}" to this feature?',
              style: TextStyle(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            Divider(),
            Row(
              children: [
                Icon(Icons.info, color: Colors.grey),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'Some users may lose access to this feature.',
                    softWrap: true,
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.visible,
                  ),
                ),
              ],
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
            child: Text('Link'),
          ),
        ],
      ),
    );
    if (confirmed != true) {
      return;
    }

    try {
      final linkResponse = await Client.post("constraints/link", {
        'flagId': widget.flag.id,
        'constraintId': constraint.id,
      }, ref.read(userStatusNotifierProvider).token);

      if (linkResponse.statusCode != 200) {
        dlog(
          'Failed to link constraint: ${linkResponse.statusCode} - ${linkResponse.body}',
        );
        throw Exception('Failed to link constraint');
      }

      widget.fetchFlagDetails();
    } catch (e) {
      dlog('Error linking constraint: $e');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to link constraint'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> unlinkConstraint(Constraint constraint) async {
    // Confirm unlink action
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Remove "${constraint.description}" from this feature?',
              style: TextStyle(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            Divider(),
            Row(
              children: [
                Icon(Icons.info, color: Colors.grey),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'More users may acquire access to this feature.',
                    softWrap: true,
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.visible,
                  ),
                ),
              ],
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
            child: Text('Unlink'),
          ),
        ],
      ),
    );
    if (confirmed != true) {
      return;
    }

    try {
      unlinking = true;

      final unlinkResponse = await Client.post("constraints/unlink", {
        'flagId': widget.flag.id,
        'constraintId': constraint.id,
      }, ref.read(userStatusNotifierProvider).token);

      if (unlinkResponse.statusCode != 200) {
        dlog(
          'Failed to unlink constraint: ${unlinkResponse.statusCode} - ${unlinkResponse.body}',
        );
        throw Exception('Failed to unlink constraint');
      }

      widget.fetchFlagDetails();
    } catch (e) {
      dlog('Error unlinking constraint: $e');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to unlink constraint'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      unlinking = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpansionTile(
          title: Text(
            '${widget.linkableConstraints.length} Available Constraints',
          ),
          childrenPadding: EdgeInsets.only(bottom: 2),
          children: [
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: LimitedBox(
                maxHeight: 300,
                child: widget.linkableConstraints.isEmpty
                    ? SizedBox(
                        height: 50,
                        child: Center(
                          child: Text(
                            'No available constraints',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      )
                    : ImplicitlyAnimatedList<Constraint>(
                        items: widget.linkableConstraints.toList(),
                        areItemsTheSame: (a, b) => a.id == b.id,
                        shrinkWrap: true,
                        itemBuilder: (context, animation, constraint, index) {
                          return SizeFadeTransition(
                            sizeFraction: 0.7,
                            curve: Curves.easeInOut,
                            animation: animation,
                            child: Card(
                              key: ValueKey(constraint.id),
                              shape: RoundedRectangleBorder(
                                side: BorderSide(
                                  color: const Color.fromARGB(
                                    255,
                                    255,
                                    167,
                                    240,
                                  ),
                                  width: 2.0,
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(4.0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
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
                                        linkConstraint(constraint);
                                      },
                                    ),
                                  ],
                                ),
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
          title: Text('${widget.flag.constraints.length} Applied Constraints'),
          childrenPadding: EdgeInsets.only(bottom: 2),
          initiallyExpanded: true,
          children: [
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: LimitedBox(
                maxHeight: 300,
                child: widget.flag.constraints.isEmpty
                    ? SizedBox(
                        height: 50,
                        child: Center(
                          child: Text(
                            'No applied constraints',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      )
                    : ImplicitlyAnimatedList<Constraint>(
                        items: widget.flag.constraints,
                        areItemsTheSame: (a, b) => a.id == b.id,
                        shrinkWrap: true,
                        itemBuilder: (context, animation, constraint, index) {
                          return SizeFadeTransition(
                            sizeFraction: 0.7,
                            curve: Curves.easeInOut,
                            animation: animation,
                            child: Card(
                              key: ValueKey(constraint.id),
                              shape: RoundedRectangleBorder(
                                side: BorderSide(
                                  color: const Color.fromARGB(
                                    255,
                                    255,
                                    167,
                                    240,
                                  ),
                                  width: 2.0,
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(4.0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
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
                                    unlinking
                                        ? SizedBox(
                                            width: 24,
                                            height: 24,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                            ),
                                          )
                                        : IconButton(
                                            icon: const Icon(Icons.link_off),
                                            onPressed: () {
                                              unlinkConstraint(constraint);
                                            },
                                          ),
                                  ],
                                ),
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
