import 'package:flutter/material.dart';

class Flags extends StatefulWidget {
  const Flags({super.key});

  @override
  State<Flags> createState() => _FlagsState();
}

class _FlagsState extends State<Flags> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(body: const Center(child: Text('Flags')));
  }
}
