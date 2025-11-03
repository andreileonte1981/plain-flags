import 'package:flutter/material.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/screens/flags/flag_badges.dart';

class FlagCard extends StatefulWidget {
  final Flag flag;

  const FlagCard({super.key, required this.flag});

  @override
  State<FlagCard> createState() => _FlagCardState();
}

class _FlagCardState extends State<FlagCard> {
  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        side: BorderSide(
          color: const Color.fromARGB(255, 0, 61, 46),
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
                Icon(Icons.flag),
                SizedBox(width: 8),
                Flexible(child: Text(widget.flag.name, softWrap: true)),
              ],
            ),
            Divider(height: 4, color: Colors.grey),
            FlagBadges(flag: widget.flag),
          ],
        ),
      ),
    );
  }
}
