import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hackncsu_today/screens/home/organizer/models/task.dart';

class ExecuteModal extends ConsumerWidget {
  final Task task;

  const ExecuteModal(this.task, {super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AlertDialog(
      icon: const Icon(Icons.build),
      title: Text('Execute Task'),
      content: Text(task.content),
      actions: [
        TextButton(onPressed: () => context.pop(), child: const Text('Cancel')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.onPrimary,
          ),
          onPressed: () async {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Executing task...'),
                behavior: SnackBarBehavior.floating,
              ),
            );

            try {
              await task.onExecute(ref);

              if (context.mounted) {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Task executed successfully!'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );

                context.pop();
              }
            } catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(e.toString()),
                    backgroundColor: Theme.of(context).colorScheme.error,
                    behavior: SnackBarBehavior.floating,
                    duration: const Duration(seconds: 10),
                  ),
                );

                context.pop();
              }
            }
          },
          child: const Text('Execute'),
        ),
      ],
    );
  }
}
