import 'package:flutter/material.dart';
import 'package:plainflags_app/widgets/bottom_nav.dart';

class ScaffoldWithNav extends StatefulWidget {
  final Widget? child;

  const ScaffoldWithNav({super.key, this.child});

  @override
  State<ScaffoldWithNav> createState() => _ScaffoldWithNavState();
}

class _ScaffoldWithNavState extends State<ScaffoldWithNav> {
  @override
  Widget build(BuildContext context) {
    final child = widget.child;
    return SafeArea(
      child: Scaffold(
        // resizeToAvoidBottomInset: false,
        body: child,
        bottomNavigationBar: BottomNav(),
      ),
    );
  }
}
