import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/screens/home/organizer/components/execute_modal.dart';
import 'package:hackncsu_today/screens/home/organizer/models/task.dart';
import 'package:hackncsu_today/screens/home/participant/components/links_card.dart';
import 'package:hackncsu_today/screens/home/participant/components/resources_card.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';

class OrganizerView extends ConsumerWidget {
  const OrganizerView({super.key});

  List<Task> get organizerTasks => [
    Task(
      title: 'Initialize Event Data',
      content:
          'Initializes hackathon event state and data in database, and adds sample data.\n'
          'This creates structure for hackathon state and supplementary data (links, resources, etc.)\n\n'
          'Should be executed once at the start of the event, before any participants join.\n'
          'Afterwards, edit the data to set the discord server invite etc. and make sure to set hidden to false so it shows up for participants.',
      onExecute: (ref) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.initializeEventData();
      },
    ),
    // TODO: add tasks for managing event state, like starting the event
    // also add (separate?) ui for adding/removing links and resources and stuff
  ];

  List<Widget> get cards => [LinksCard(showHidden: true), ResourcesCard()];

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
          Text('Tasks', style: Theme.of(context).textTheme.titleLarge),
          Text('Click a button to see task description'),
          const SizedBox(height: 8),
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
          const SizedBox(height: 16),
          Text(
            'Participant Cards',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Wrap(
            children:
                cards.map((card) {
                  return SizedBox(width: 400, height: 200, child: card);
                }).toList(),
          ),
        ],
      ),
    );
  }
}
