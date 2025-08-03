import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hackncsu_today/screens/home/organizer/models/task.dart';

class ExecuteModal extends ConsumerStatefulWidget {
  final Task task;

  const ExecuteModal(this.task, {super.key});

  @override
  ConsumerState<ExecuteModal> createState() => _ExecuteModalState();
}

class _ExecuteModalState extends ConsumerState<ExecuteModal> {
  bool _isExecuting = false;

  Future<void> _executeTask() async {
    setState(() {
      _isExecuting = true;
    });

    try {
      await widget.task.onExecute(ref);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Task executed successfully!'),
            behavior: SnackBarBehavior.floating,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
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
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: const Icon(Icons.build),
      title: Text('Execute Task'),
      content: Text(widget.task.content),
      actions: [
        TextButton(onPressed: () => context.pop(), child: const Text('Cancel')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.onPrimary,
          ),
          onPressed: _isExecuting ? null : _executeTask,
          child: const Text('Execute'),
        ),
      ],
    );
  }
}
