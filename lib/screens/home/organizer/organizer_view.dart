import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/features/streams/event_state_stream.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/screens/home/organizer/components/edit_resources_modal.dart';
import 'package:hackncsu_today/screens/home/organizer/components/editable_overlay.dart';
import 'package:hackncsu_today/screens/home/organizer/components/execute_modal.dart';
import 'package:hackncsu_today/screens/home/organizer/models/task.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/live_card.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/resource_card.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:hackncsu_today/services/organizer/task_service.dart';

class OrganizerView extends ConsumerWidget {
  const OrganizerView({super.key});

  

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

  Widget _taskWrapBuilder(BuildContext context, List<Task> tasks) {
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      alignment: WrapAlignment.center,
      runAlignment: WrapAlignment.center,
      children:
          tasks.map((task) {
            return ElevatedButton(
              onPressed: () => _showTaskExecuteModal(context, task),
              child: Text(task.title),
            );
          }).toList(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final taskService = ref.watch(taskServiceProvider);

    return Center(
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Organizer View',
              style: Theme.of(
                context,
              ).textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            Text(
              'This view is for organizers to manage the event state and resources. Tasks require confirmation so feel free to explore.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Divider(),

            const SizedBox(height: 16),
            Text('Quick Tasks', style: Theme.of(context).textTheme.titleLarge),
            Text(
              'These tasks are quick actions to set up the event state and resources.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            _taskWrapBuilder(context, taskService.quickTasks),
            const SizedBox(height: 16),
            Divider(),
            const SizedBox(height: 16),
            Text(
              'Event State Management',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              'Use the tasks below to manage the event state. You may need to provide parameters for some tasks.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            _taskWrapBuilder(context, taskService.eventStateManagementTasks),
            const SizedBox(height: 16),
            Divider(),
            const SizedBox(height: 16),
            Text(
              'Participant Cards',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              'These cards are visible to participants. Click the edit icon to modify its content.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Wrap(
              alignment: WrapAlignment.center,
              runAlignment: WrapAlignment.center,

              children:
                  _cardsBuilder(context).map((card) {
                    return SizedBox(width: 500, height: 200, child: card);
                  }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
