import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  late List<TaskParameter> _parameters;

  @override
  void initState() {
    super.initState();
    _parameters = widget.task.parameters?.call(ref) ?? [];
  }

  Future<void> _executeTask() async {
    setState(() {
      _isExecuting = true;
    });

    try {
      await widget.task.onExecute(ref, _parameters);
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

  List<Widget> _buildParameterFields() {
    return _parameters.map((p) {
      final index = _parameters.indexOf(p);
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),

        child: switch (p) {
          StringTaskParameter() => TextFormField(
            initialValue: p.value,
            decoration: InputDecoration(
              labelText: p.description,
              border: const OutlineInputBorder(),
            ),
            onChanged: (newValue) {
              setState(() {
                _parameters[index] = TaskParameter.string(
                  p.description,
                  value: newValue,
                );
              });
            },
          ),
          IntegerTaskParameter() => TextFormField(
            initialValue: p.value.toString(),
            decoration: InputDecoration(
              labelText: p.description,
              border: const OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            onChanged: (newValue) {
              setState(() {
                _parameters[index] = TaskParameter.integer(
                  p.description,
                  value: int.tryParse(newValue) ?? p.value,
                );
              });
            },
          ),
          BooleanTaskParameter() => SwitchListTile(
            title: Text(p.description),
            value: p.value,
            onChanged: (newValue) {
              setState(() {
                _parameters[index] = TaskParameter.boolean(
                  p.description,
                  value: newValue,
                );
              });
            },
          ),
          DoubleTaskParameter() => TextFormField(
            initialValue: p.value.toString(),
            decoration: InputDecoration(
              labelText: p.description,
              border: const OutlineInputBorder(),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
            ],
            onChanged: (newValue) {
              setState(() {
                _parameters[index] = TaskParameter.doubleValue(
                  p.description,
                  value: double.tryParse(newValue) ?? p.value,
                );
              });
            },
          ),
          DateTimeTaskParameter() => ListTile(
            title: Text(p.description),
            subtitle: Text(p.value.toString()),
            trailing: const Icon(Icons.calendar_today),
            onTap: () async {
              final newDate = await showDatePicker(
                context: context,
                initialDate: p.value,
                firstDate: DateTime(2000),
                lastDate: DateTime(2100),
              );
              if (newDate == null) return;

              if (!mounted) return;

              final newTime = await showTimePicker(
                context: context,
                initialTime: TimeOfDay.fromDateTime(p.value),
                initialEntryMode: TimePickerEntryMode.input,
              );
              if (newTime == null) return;

              setState(() {
                final newDateTime = DateTime(
                  newDate.year,
                  newDate.month,
                  newDate.day,
                  newTime.hour,
                  newTime.minute,
                );
                _parameters[index] = TaskParameter.dateTime(
                  p.description,
                  newDateTime,
                );
              });
            },
          ),
        },
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: const Icon(Icons.build),
      title: Text('Execute Task: ${widget.task.title}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.task.content),
            if (widget.task.parameters != null) ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 16),
              ..._buildParameterFields(),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => context.pop(), child: const Text('Cancel')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
          ),
          onPressed: _isExecuting ? null : _executeTask,
          child:
              _isExecuting
                  ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(),
                  )
                  : const Text('Execute'),
        ),
      ],
    );
  }
}
