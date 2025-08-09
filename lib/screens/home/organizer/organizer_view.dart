import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/screens/home/organizer/components/edit_resources_modal.dart';
import 'package:hackncsu_today/screens/home/organizer/components/editable_overlay.dart';
import 'package:hackncsu_today/screens/home/organizer/components/execute_modal.dart';
import 'package:hackncsu_today/screens/home/organizer/models/task.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/live_card.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/resource_card.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';

class OrganizerView extends ConsumerWidget {
  const OrganizerView({super.key});

  List<Task> get organizerTasks => [
    Task(
      title: 'Initialize Event',
      content:
          'Initializes hackathon event state and data in database, and adds sample data.\n'
          'This creates structure for hackathon state and supplementary data (links, resources, etc.)\n\n'
          'Should be executed once at the start of the event, before any participants join.\n'
          'Afterwards, edit the data to set the discord server invite etc. and make sure to set hidden to false so it shows up for participants.',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.initializeEvent();
      },
    ),
    Task(
      title: 'Set State to Opening Ceremony',
      content:
          'Changes the event state to Opening Ceremony.\n\n'
          'This should be executed when the opening ceremony starts.',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.updateEventState(EventState.openingCeremony());
      },
    ),
    Task(
      title: 'Set State to In Progress',
      content:
          'Changes the event state to In Progress.\n\n'
          'This should be executed when the hackathon starts.',
      parameters: [
        TaskParameter.dateTime(
          'Hackathon End Time (default is 24h from now)',
          DateTime.now().add(const Duration(hours: 24)),
        ),
      ],
      onExecute: (ref, parameters) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);

        final startTime = DateTime.now();
        final endTime = parameters[0] as DateTimeTaskParameter;

        await firestoreService.updateEventState(
          EventState.inProgress(startTime: startTime, endTime: endTime.value),
        );
      },
    ),
    Task(
      title: 'Set State to Closing Ceremony',
      content:
          'Changes the event state to Closing Ceremony.\n\n'
          'This should be executed when the closing ceremony starts.',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.updateEventState(EventState.closingCeremony());
      },
    ),
  ];

  List<Widget> _cardsBuilder(BuildContext context) => [
    LiveCard(),
    EditableOverlay(
      onEdit: () => _showEditResourcesModal(context, ResourceSource.internal),
      child: ResourceCard(ResourceSource.internal, showHidden: true),
    ),
    EditableOverlay(
      onEdit: () => _showEditResourcesModal(context, ResourceSource.external),
      child: ResourceCard(ResourceSource.external, showHidden: true),
    ),
  ];

  void _showEditResourcesModal(BuildContext context, ResourceSource source) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return EditResourcesModal(source: source);
      },
    );
  }

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
          Text('Click a button to see task description and execute it.'),
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
                _cardsBuilder(context).map((card) {
                  return SizedBox(width: 500, height: 200, child: card);
                }).toList(),
          ),
        ],
      ),
    );
  }
}
