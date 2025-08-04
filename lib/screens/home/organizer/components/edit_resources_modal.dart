import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hackncsu_today/features/streams/event_data_stream.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';

class EditResourcesModal extends ConsumerStatefulWidget {
  final ResourceSource source;

  const EditResourcesModal({super.key, required this.source});

  @override
  ConsumerState<EditResourcesModal> createState() => _EditResourcesModalState();
}

class _EditResourcesModalState extends ConsumerState<EditResourcesModal> {
  bool _isSaving = false;

  late List<Resource> _resources;
  final _formKey = GlobalKey<FormState>();

  // To store form field values
  final List<TextEditingController> _nameControllers = [];
  final List<TextEditingController> _valueControllers = [];
  final List<ActionType?> _actionTypes = [];

  @override
  void initState() {
    super.initState();

    final eventData = ref.read(eventDataStreamProvider).asData?.value;

    _resources =
        (widget.source == ResourceSource.internal
                ? eventData?.internalResources ?? []
                : eventData?.externalResources ?? [])
            .toList();

    for (final resource in _resources) {
      _nameControllers.add(TextEditingController(text: resource.name));

      switch (resource) {
        case LinkResource():
          _valueControllers.add(TextEditingController(text: resource.url));
          _actionTypes.add(null); // Placeholder for action type
        case ActionResource():
          _valueControllers.add(TextEditingController()); // Placeholder
          _actionTypes.add(resource.action);
      }
    }
  }

  @override
  void dispose() {
    for (var controller in _nameControllers) {
      controller.dispose();
    }
    for (var controller in _valueControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onSave() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isSaving = true;
      });

      final newResources = <Resource>[];

      for (int i = 0; i < _resources.length; i++) {
        final originalResource = _resources[i];
        final name = _nameControllers[i].text;

        switch (originalResource) {
          case LinkResource(:final hidden):
            final url = _valueControllers[i].text;
            newResources.add(Resource.link(name, url, hidden: hidden));
          case ActionResource(:final hidden):
            final action = _actionTypes[i]!;
            newResources.add(Resource.action(name, action, hidden: hidden));
        }
      }

      final eventData = ref.read(eventDataStreamProvider).asData?.value;

      final newEventData = switch (widget.source) {
        ResourceSource.internal => eventData?.copyWith(
          internalResources: newResources,
        ),
        ResourceSource.external => eventData?.copyWith(
          externalResources: newResources,
        ),
      };

      if (newEventData == null) {
        setState(() {
          _isSaving = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to save changes.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
        return;
      }

      await ref
          .read(firebaseFirestoreServiceProvider)
          .updateEventData(newEventData);

      if (mounted) {
        context.pop();
      }
    }
  }

  void _removeResource(int index) {
    setState(() {
      _resources.removeAt(index);
      _nameControllers.removeAt(index).dispose();
      _valueControllers.removeAt(index).dispose();
      _actionTypes.removeAt(index);
    });
  }

  void _toggleHidden(int index) {
    setState(() {
      final resource = _resources[index];
      _resources[index] = switch (resource) {
        LinkResource() => resource.copyWith(hidden: !resource.hidden),
        ActionResource() => resource.copyWith(hidden: !resource.hidden),
      };
    });
  }

  void _addLinkResource() {
    setState(() {
      _resources.add(const Resource.link('', ''));
      _nameControllers.add(TextEditingController());
      _valueControllers.add(TextEditingController());
      _actionTypes.add(null);
    });
  }

  void _addActionResource() {
    setState(() {
      final defaultAction = ActionType.values.first;
      _resources.add(Resource.action('', defaultAction));
      _nameControllers.add(TextEditingController());
      _valueControllers.add(TextEditingController()); // Placeholder
      _actionTypes.add(defaultAction);
    });
  }

  Widget _linkFieldBuilder(BuildContext context, int index) {
    final resource = _resources[index];
    return Row(
      children: [
        Expanded(
          child: TextFormField(
            controller: _nameControllers[index],
            decoration: const InputDecoration(labelText: 'Name'),
            validator:
                (value) =>
                    value?.isEmpty ?? true ? 'Name cannot be empty' : null,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: TextFormField(
            controller: _valueControllers[index],
            decoration: const InputDecoration(labelText: 'URL'),
            validator:
                (value) =>
                    value?.isEmpty ?? true ? 'URL cannot be empty' : null,
          ),
        ),
        IconButton(
          icon: Icon(resource.hidden ? Icons.visibility_off : Icons.visibility),
          onPressed: () => _toggleHidden(index),
          tooltip: 'Hide for Participants: ${resource.hidden}',
        ),
        IconButton(
          icon: const Icon(Icons.delete),
          onPressed: () => _removeResource(index),
          tooltip: 'Remove Link Resource',
        ),
      ],
    );
  }

  Widget _actionFieldBuilder(BuildContext context, int index) {
    final resource = _resources[index];
    return Row(
      children: [
        Expanded(
          child: TextFormField(
            controller: _nameControllers[index],
            decoration: const InputDecoration(labelText: 'Name'),
            validator:
                (value) =>
                    value?.isEmpty ?? true ? 'Name cannot be empty' : null,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: DropdownButtonFormField<ActionType>(
            value: _actionTypes[index],
            items:
                ActionType.values
                    .map(
                      (type) =>
                          DropdownMenuItem(value: type, child: Text(type.name)),
                    )
                    .toList(),
            onChanged: (value) {
              setState(() {
                _actionTypes[index] = value;
              });
            },
            decoration: const InputDecoration(labelText: 'Action'),
          ),
        ),
        IconButton(
          icon: Icon(resource.hidden ? Icons.visibility_off : Icons.visibility),
          onPressed: () => _toggleHidden(index),
          tooltip: 'Hide for Participants: ${resource.hidden}',
        ),
        IconButton(
          icon: const Icon(Icons.delete),
          onPressed: () => _removeResource(index),
          tooltip: 'Remove Action Resource',
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: const Icon(Icons.build),
      title: Text('Edit ${widget.source.name} Resources'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: _resources.length,
              itemBuilder: (context, index) {
                final resource = _resources[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: switch (resource) {
                    LinkResource() => _linkFieldBuilder(context, index),
                    ActionResource() => _actionFieldBuilder(context, index),
                  },
                );
              },
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSaving ? null : () => context.pop(),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _addLinkResource,
          child: const Text('Add Link Resource'),
        ),
        TextButton(
          onPressed: _addActionResource,
          child: const Text('Add Action Resource'),
        ),
        ElevatedButton(
          onPressed: _isSaving ? null : _onSave,
          child: const Text('Save'),
        ),
      ],
    );
  }
}
