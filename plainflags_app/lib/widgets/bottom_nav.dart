import 'package:flutter/material.dart';

class BottomNav extends StatefulWidget {
  const BottomNav({super.key});

  @override
  State<BottomNav> createState() => _BottomNavState();
}

class _BottomNavState extends State<BottomNav> {
  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.flag), label: 'Flags'),
        BottomNavigationBarItem(icon: Icon(Icons.shield), label: 'Constraints'),
      ],
      onTap: (value) => {
        if (value == 0) {Navigator.pushReplacementNamed(context, '/flags')},
        if (value == 1)
          {Navigator.pushReplacementNamed(context, '/constraints')},
      },
    );
  }
}
