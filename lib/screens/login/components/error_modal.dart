import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ErrorModal extends StatelessWidget {
  final String content;
  const ErrorModal(this.content, {super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text("Error Authenticating"),
      icon: Icon(Icons.warning),
      content: Text(content),
      actions: [TextButton(onPressed: () => context.pop(), child: Text("OK"))],
    );
  }
}
