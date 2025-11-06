import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/flag.dart';

class FlagDetails extends ConsumerStatefulWidget {
  final Flag flag;
  const FlagDetails({super.key, required this.flag});

  @override
  ConsumerState<FlagDetails> createState() => _FlagDetailsState();
}

class _FlagDetailsState extends ConsumerState<FlagDetails> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Flag Details')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Name: ${widget.flag.name}', style: TextStyle(fontSize: 18)),
            SizedBox(height: 8),
            Text(
              'Status: ${widget.flag.isOn ? "On" : "Off"}',
              style: TextStyle(fontSize: 18),
            ),
            SizedBox(height: 8),
            Text(
              'Stale: ${widget.flag.stale ? "Yes" : "No"}',
              style: TextStyle(fontSize: 18),
            ),
            // Add more flag details as needed
          ],
        ),
      ),
    );
  }
}
