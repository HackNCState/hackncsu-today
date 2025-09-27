import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/features/streams/event_state_stream.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/screens/home/views/organizer/models/task.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'task_service.g.dart';

/// Manages tasks that organizers can run
@riverpod
TaskService taskService(Ref ref) {
  return TaskService();
}

class TaskService {
  List<Task> get quickTasks => [
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
      title: 'Post announcement',
      content:
          'Posts an announcement to the event state.\n'
          'This is useful for quick announcements or updates during the event.\n'
          'It will appear under the countdown timer on the Live Card with format "Announcement: <announcement>".\n'
          'Please remember to remove it when it is no longer relevant.',
      parameters: (_) => [TaskParameter.string('Content')],
      onExecute: (ref, parameters) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        final announcement = parameters[0] as StringTaskParameter;

        final eventState = ref.read(eventStateStreamProvider).valueOrNull;
        if (eventState == null) {
          throw TaskExecutionException('Event state is not initialized.');
        }

        final updatedEventState = eventState.copyWith(
          announcement: announcement.value.trim(),
        );
        await firestoreService.updateEventState(updatedEventState);
      },
    ),
    Task(
      title: 'Remove announcement',
      content:
          'Removes the announcement from the event state.\n'
          'This is useful when the announcement is no longer relevant.',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        final eventState = ref.read(eventStateStreamProvider).valueOrNull;
        if (eventState == null) {
          throw TaskExecutionException('Event state is not initialized.');
        }

        final updatedEventState = eventState.copyWith(announcement: null);
        await firestoreService.updateEventState(updatedEventState);
      },
    ),
  ];

  List<Task> get eventStateManagementTasks => [
    Task(
      title: 'Set State to Initial State',
      content:
          'Changes the event state to Initial.\n'
          'Pre-event state, before opening ceremony.',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.updateEventState(EventState.initial());
      },
    ),
    Task(
      title: 'Set State to Standby',
      content:
          'Changes the event state to Standby.\n'
          'This should be executed between states (between in progress and judging, for example).',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.updateEventState(EventState.standby());
      },
    ),
    Task(
      title: 'Set State to Opening Ceremony',
      content:
          'Changes the event state to Opening Ceremony.\n'
          'This should be executed when the opening ceremony starts.',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.updateEventState(EventState.openingCeremony());
      },
    ),
    Task(
      title: 'Set State to In Progress',
      content:
          'Changes the event state to In Progress.\n'
          'This should be executed when the hackathon starts.',
      parameters:
          (_) => [
            TaskParameter.dateTime(
              'Hackathon End Time\n(default: 24h from now)',
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
          'Changes the event state to Closing Ceremony.\n'
          'This should be executed when the closing ceremony starts.',
      onExecute: (ref, _) async {
        final firestoreService = ref.read(firebaseFirestoreServiceProvider);
        await firestoreService.updateEventState(EventState.closingCeremony());
      },
    ),
  ];
}

class TaskExecutionException extends AppException {
  TaskExecutionException(super.message);
}
