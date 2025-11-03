import 'package:flutter/material.dart';
import 'package:plainflags_app/domain/flag.dart';

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
        side: BorderSide(color: Colors.blue, width: 2.0),
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: ListTile(
        title: Text(widget.flag.name),
        subtitle: Text('ID: ${widget.flag.id}'),
      ),
    );
  }
}
