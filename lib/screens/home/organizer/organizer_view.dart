import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/screens/home/organizer/components/execute_modal.dart';
import 'package:hackncsu_today/screens/home/organizer/models/task.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';

class OrganizerView extends ConsumerWidget {
  const OrganizerView({super.key});

  List<Task> get organizerTasks => [
    Task(
      title: 'Initialize Event Data',
      content:
          'This task initializes hackathon event data in Firestore.\n'
          'This includes setting up the event state and creating structure to store links, resources, and other event-related information.\n'
          'This task should be executed once at the start of the event, before any participants join.\n'
          'After executing this task, edit the structure to add links to the Discord server etc. and make sure they are not hidden.',
      onExecute: (ref) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.initializeEventData();
      },
    ),
  ];

  void _showTaskExecuteModal(BuildContext context, Task task) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ExecuteModal(task);
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Organizer View',
            style: Theme.of(
              context,
            ).textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children:
                organizerTasks.map((task) {
                  return ElevatedButton(
                    onPressed: () => _showTaskExecuteModal(context, task),
                    child: Text(task.title),
                  );
                }).toList(),
          ),
        ],
      ),
    );
  }
}
