import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Archived extends ConsumerStatefulWidget {
  const Archived({super.key});

  @override
  ConsumerState<Archived> createState() => _ArchivedState();
}

class _ArchivedState extends ConsumerState<Archived> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(body: Center(child: Text('Archived Flags')));
  }
}
