import 'package:flutter/material.dart';
import 'package:plainflags_app/domain/flag.dart';

class FlagBadges extends StatefulWidget {
  final Flag flag;

  const FlagBadges({super.key, required this.flag});

  @override
  State<FlagBadges> createState() => _FlagBadgesState();
}

class _FlagBadgesState extends State<FlagBadges> {
  @override
  Widget build(BuildContext context) {
    final flag = widget.flag;

    return Row(
      children: [
        flag.isOn
            ? Chip(
                labelPadding: EdgeInsets.all(2),
                label: Row(
                  children: [
                    Text(
                      'on',
                      style: TextStyle(
                        color: Colors.green[800],
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.flag, color: Colors.green[800], size: 16),
                  ],
                ),
                backgroundColor: Colors.green[200],
              )
            : Chip(
                labelPadding: EdgeInsets.all(2),
                label: Row(
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
                backgroundColor: Colors.grey[400],
              ),
        SizedBox(width: 8),
        if (flag.stale)
          Chip(
            labelPadding: EdgeInsets.all(2),
            label: Row(
              children: [
                Text(
                  'stale',
                  style: TextStyle(
                    color: const Color.fromARGB(255, 185, 158, 0),
                  ),
                ),
                SizedBox(width: 4),
                Icon(
                  Icons.hourglass_bottom,
                  color: const Color.fromARGB(255, 185, 158, 0),
                  size: 16,
                ),
              ],
            ),
            backgroundColor: const Color.fromARGB(255, 255, 252, 203),
          ),
        if (flag.constraints.isNotEmpty)
          Chip(
            labelPadding: EdgeInsets.all(2),
            label: Row(
              children: [
                Text(
                  'constrained',
                  style: TextStyle(
                    color: const Color.fromARGB(255, 179, 0, 170),
                  ),
                ),
                SizedBox(width: 4),
                Icon(
                  Icons.hourglass_bottom,
                  color: const Color.fromARGB(255, 179, 0, 170),
                  size: 16,
                ),
              ],
            ),
            backgroundColor: const Color.fromARGB(255, 255, 171, 255),
          ),
      ],
    );
  }
}
