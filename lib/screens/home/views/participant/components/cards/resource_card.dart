import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/streams/event_data_stream.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/screens/home/views/participant/components/cards/basic_card.dart';
import 'package:hackncsu_today/screens/home/views/participant/components/resource_items/internal_resource_item.dart';
import 'package:hackncsu_today/screens/home/views/participant/components/resource_items/link_resource_item.dart';

class ResourceCard extends ConsumerWidget {
  final bool showHidden;
  final ResourceSource source;
  const ResourceCard(this.source, {super.key, this.showHidden = false});

  Widget _buildList(List<Resource> resources) {
    return ListView.builder(
      itemCount: resources.length,
      itemBuilder: (context, index) {
        final resource = resources[index];

        switch (resource) {
          case LinkResource():
            return LinkResourceItem(resource);
          case ActionResource():
            return InternalResourceItem(resource);
        }
      },
    );
  }

  Widget _emptyListPlaceholder() {
    final String name;

    switch (source) {
      case ResourceSource.external:
        name = 'links';
        break;
      case ResourceSource.internal:
        name = 'resources';
        break;
    }

    return Center(child: Text('No $name available at the moment.'));
  }

  Widget _errorPlaceholder(String error, WidgetRef ref) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Error loading data: $error'),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () {
            ref.invalidate(eventDataStreamProvider);
          },
          child: const Text('Retry'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventData = ref.watch(eventDataStreamProvider);

    final String title;
    final String helpText;

    switch (source) {
      case ResourceSource.external:
        title = 'LINKS';
        helpText =
            'Helpful links to external websites\nThis card is live and updates automatically if new links are added.';
        break;
      case ResourceSource.internal:
        title = 'RESOURCES';
        helpText =
            'Resources essential to your Hack_NCState experience\nThis card is live and updates automatically if new resources are added.';
        break;
    }

    return BasicCard(
      title: title,
      helpText: helpText,
      child: eventData.when(
        data: (data) {
          final List<Resource>? resourceList;

          switch (source) {
            case ResourceSource.external:
              resourceList = data?.externalResources;
              break;
            case ResourceSource.internal:
              resourceList = data?.internalResources;
              break;
          }

          final eventData =
              resourceList
                  ?.where((resource) => showHidden || !resource.hidden)
                  .toList() ??
              [];

          if (eventData.isEmpty) {
            return _emptyListPlaceholder();
          }
          return _buildList(eventData);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _errorPlaceholder(error.toString(), ref),
      ),
    );
  }
}
