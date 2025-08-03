import 'package:flutter/material.dart';
import 'package:hackncsu_today/features/authenticator.dart';

class AuthenticatingModal extends StatelessWidget {
  final Authenticating state;

  const AuthenticatingModal({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Authenticating...'),
      icon: Icon(Icons.lock_clock_outlined),
      content: Text(state.message),
    );
  }
}
