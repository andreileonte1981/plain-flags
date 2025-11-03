import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/globals/capabilities.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/globals/user_storage.dart';
import 'package:plainflags_app/widgets/main_navigation_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  await Capabilities.init();

  await Client.init();

  await UserStorage().init();

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Plain Flags',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color.fromARGB(255, 255, 255, 255),
        appBarTheme: AppBarTheme(
          backgroundColor: const Color.fromARGB(255, 189, 255, 239),
          foregroundColor: const Color.fromARGB(255, 0, 29, 24),
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
          color: const Color.fromARGB(255, 243, 255, 252),
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
          backgroundColor: const Color.fromARGB(255, 189, 255, 239),
          unselectedLabelStyle: TextStyle(
            color: const Color.fromARGB(255, 73, 73, 73),
          ),
          selectedLabelStyle: TextStyle(
            color: const Color.fromARGB(255, 20, 20, 20),
          ),
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(
          backgroundColor: const Color.fromARGB(255, 0, 147, 122),
          foregroundColor: Colors.white,
        ),
        switchTheme: SwitchThemeData(
          thumbColor: WidgetStateProperty.resolveWith<Color>((states) {
            if (states.contains(WidgetState.selected)) {
              return const Color.fromARGB(255, 134, 242, 216);
            }
            return Colors.grey;
          }),
          trackColor: WidgetStateProperty.resolveWith<Color>((states) {
            if (states.contains(WidgetState.selected)) {
              return const Color.fromARGB(255, 0, 147, 122);
            }
            return Colors.grey.shade400;
          }),
        ),
        useMaterial3: true,
      ),
      home: const MainNavigationScreen(),
    );
  }
}
