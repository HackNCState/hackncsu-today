import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/config/constants.dart';
import 'package:hackncsu_today/config/router.dart';
import 'package:hackncsu_today/config/firebase_options.dart';
import 'package:responsive_framework/responsive_framework.dart'; // Update import path
import 'package:hive_ce_flutter/hive_flutter.dart';

void main() async {
  await Hive.initFlutter();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  if (kDebugMode && kFirebaseUseEmulator) {
    print('Using Firebase Emulator');
    FirebaseFirestore.instance.useFirestoreEmulator('localhost', 5500);
    FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
    FirebaseFunctions.instance.useFunctionsEmulator('localhost', 5001);
  }

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromARGB(255, 189, 18, 18),
          brightness: Brightness.dark,
        ),
      ),
      debugShowCheckedModeBanner: false,
      builder:
          (context, child) => ResponsiveBreakpoints.builder(
            child: child!,
            breakpoints: [
              const Breakpoint(start: 0, end: 700, name: MOBILE),
              const Breakpoint(start: 701, end: double.infinity, name: DESKTOP),
            ],
          ),
    );
  }
}
