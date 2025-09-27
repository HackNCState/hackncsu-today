import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/screens/home/views/organizer/components/execute_modal.dart';
import 'package:hackncsu_today/screens/home/views/organizer/models/task.dart';
import 'package:hackncsu_today/services/organizer/task_service.dart';

class TasksPage extends ConsumerWidget {
  const TasksPage({super.key});

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
    final taskService = ref.watch(taskServiceProvider);

    return SingleChildScrollView(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Quick Tasks', style: Theme.of(context).textTheme.titleLarge),
          Text(
            'These tasks are quick actions to manage the event. Click on one to see its description.',
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
        ],
      ),
    );
  }
}
