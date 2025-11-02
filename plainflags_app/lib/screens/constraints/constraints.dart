import 'package:flutter/material.dart';

class Constraints extends StatefulWidget {
  const Constraints({super.key});

  @override
  State<Constraints> createState() => _ConstraintsState();
}

class _ConstraintsState extends State<Constraints> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Constraints')),
      body: const Center(child: Text('Constraints')),
    );
  }
}
