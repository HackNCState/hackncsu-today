import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/authenticator.dart';
import 'package:pointer_interceptor/pointer_interceptor.dart';

class LogoutModal extends ConsumerWidget {
  const LogoutModal({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PointerInterceptor(
      child: AlertDialog(
        title: Text("Log out?"),
        icon: Icon(Icons.logout),
        content: Text(
          "Are you sure you want to log out? You will need to reconnect your Discord account to log in again.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text("Cancel"),
          ),
          TextButton(
            onPressed: ref.read(authenticatorProvider.notifier).logout,
            child: Text("Log out"),
          ),
        ],
      ),
    );
  }
}
