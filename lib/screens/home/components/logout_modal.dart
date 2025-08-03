import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hackncsu_today/features/authenticator.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:pointer_interceptor/pointer_interceptor.dart';

class LogoutModal extends ConsumerWidget {
  const LogoutModal({super.key});

  Widget _builder(BuildContext context, WidgetRef ref) {
    return AlertDialog(
      title: Text('Log out?'),
      icon: Icon(Icons.logout),
      content: Text(
        'Are you sure you want to log out? You will need to reconnect your Discord account to log in again.',
      ),
      actions: [
        TextButton(onPressed: () => context.pop(), child: Text('Cancel')),
        TextButton(
          onPressed: ref.read(authenticatorProvider.notifier).logout,
          child: Text('Log out'),
        ),
      ],
    );
  }

  Future<void> _switchView(BuildContext context, WidgetRef ref) async {
    context.pop();

    final state = ref.read(authenticatorProvider);

    if (state is Authenticated) {
      final user = state.user;
      final auth = ref.read(authenticatorProvider.notifier);

      await auth.debugSetUserType(
        user is Organizer ? 'participant' : 'organizer',
      );
    }
  }

  /// Debug version of the logout modal for development purposes.
  Widget _debugBuilder(BuildContext context, WidgetRef ref) {
    final state = ref.watch(authenticatorProvider);

    return AlertDialog(
      title: Text('Debug Logout Modal'),
      content: Text(
        'Perform actions for debugging purposes.\n\nCurrent User: ${state is Authenticated ? state.user : 'None'}',
      ),
      actions: [
        TextButton(onPressed: () => context.pop(), child: Text('Close')),
        TextButton(
          onPressed: ref.read(authenticatorProvider.notifier).logout,
          child: Text('Log out'),
        ),
        Tooltip(
          message:
              'Switch user type for debugging (this WILL fail if firebase is in production mode)',
          child: TextButton(
            onPressed: () => _switchView(context, ref),
            child: Text('Switch View'),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PointerInterceptor(
      child: kDebugMode ? _debugBuilder(context, ref) : _builder(context, ref),
    );
  }
}
