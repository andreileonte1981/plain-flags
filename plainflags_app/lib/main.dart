import 'package:flutter/material.dart';
import 'package:plainflags_app/screens/flags/flags.dart';
import 'package:plainflags_app/widgets/scaffold_with_nav.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Plain Flags',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color.fromARGB(255, 215, 253, 243),
        appBarTheme: AppBarTheme(
          backgroundColor: const Color.fromARGB(255, 0, 146, 122),
          foregroundColor: Colors.white,
          titleTextStyle: const TextStyle(
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
        useMaterial3: true,
      ),
      initialRoute: '/flags',
      routes: {'/flags': (context) => const Flags()},
      builder: (context, child) {
        return Overlay(
          initialEntries: [
            OverlayEntry(
              builder: (context) {
                return ScaffoldWithNav(child: child);
              },
            ),
          ],
        );
      },
    );
  }
}
