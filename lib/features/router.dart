import 'package:go_router/go_router.dart';
import 'package:hackncsu_today/screens/home/home.dart';
import 'package:hackncsu_today/screens/login/login.dart';
import 'package:hackncsu_today/screens/not_found/not_found.dart';

GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
  ],
  errorBuilder: (context, state) => NotFoundScreen(),
);
