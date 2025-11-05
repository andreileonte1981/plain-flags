import 'package:flutter/material.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_badge.dart';

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
            ? FlagBadge(
                backgroundColor: const Color.fromARGB(255, 206, 255, 207),
                strokeColor: const Color.fromARGB(255, 134, 179, 135),
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
                    Icon(Icons.flag, color: Colors.green[800], size: 16),
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
        if (flag.stale) SizedBox(width: 8),
        if (flag.stale)
          FlagBadge(
            backgroundColor: const Color.fromARGB(255, 255, 252, 203),
            strokeColor: const Color.fromARGB(255, 185, 181, 147),
            child: Row(
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
          ),
        if (flag.constraints.isNotEmpty) SizedBox(width: 8),
        if (flag.constraints.isNotEmpty)
          FlagBadge(
            backgroundColor: const Color.fromARGB(255, 255, 223, 255),
            strokeColor: const Color.fromARGB(255, 204, 179, 204),
            child: Row(
              children: [
                Text(
                  'constrained',
                  style: TextStyle(
                    color: const Color.fromARGB(255, 179, 0, 170),
                  ),
                ),
                SizedBox(width: 4),
                Icon(
                  Icons.front_hand,
                  color: const Color.fromARGB(255, 179, 0, 170),
                  size: 16,
                ),
              ],
            ),
          ),
      ],
    );
  }
}
