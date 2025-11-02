import 'package:flutter/material.dart';
import 'package:plainflags_app/widgets/main_navigation_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Plain Flags',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color.fromARGB(255, 215, 253, 243),
        appBarTheme: AppBarTheme(
          backgroundColor: const Color.fromARGB(255, 255, 255, 255),
          foregroundColor: const Color.fromARGB(255, 0, 247, 185),
          titleTextStyle: const TextStyle(
            color: Color.fromARGB(255, 0, 29, 24),
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color.fromARGB(255, 0, 88, 29),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
          ),
        ),
        cardTheme: CardThemeData(
          color: const Color.fromARGB(255, 156, 255, 230),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
        bottomSheetTheme: BottomSheetThemeData(
          backgroundColor: const Color.fromARGB(255, 215, 253, 242),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16.0)),
          ),
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: const Color.fromARGB(255, 255, 255, 255),
          selectedItemColor: const Color.fromARGB(255, 0, 147, 122),
          unselectedItemColor: const Color.fromARGB(255, 0, 88, 29),
        ),
        useMaterial3: true,
      ),
      home: const MainNavigationScreen(),
    );
  }
}
