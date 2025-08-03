import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/streams/event_data_stream.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/screens/home/participant/components/basic_card.dart';
import 'package:url_launcher/url_launcher.dart';

class LinksCard extends ConsumerWidget {
  const LinksCard({super.key});

  Widget _buildLinkList(List<Resource> resources) {
    return ListView.builder(
      itemCount: resources.length,
      itemBuilder: (context, index) {
        final resource = resources[index];
        return resource is LinkResource && !resource.hidden
            ? LinkItem(resource.name, resource.url)
            : null;
      },
    );
  }

  Widget _emptyListPlaceholder() {
    return const Center(child: Text('No links available at the moment.'));
  }

  Widget _errorPlaceholder(String error, WidgetRef ref) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Error loading links: $error'),
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

    return BasicCard(
      title: 'LINKS',
      helpText:
          'Helpful links to external websites\nThis card is live and updates automatically if new links are added.',
      child: eventData.when(
        data: (data) {
          if (data == null || data.externalResources.isEmpty) {
            return _emptyListPlaceholder();
          }
          return _buildLinkList(data.externalResources);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _errorPlaceholder(error.toString(), ref),
      ),
    );
  }
}

class LinkItem extends StatelessWidget {
  final String title;
  final String url;

  const LinkItem(this.title, this.url, {super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        launchUrl(Uri.parse(url), webOnlyWindowName: '_blank');
      },
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(title, style: Theme.of(context).textTheme.bodyLarge),
            ),
            Icon(
              Icons.open_in_new,
              size: 20,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ],
        ),
      ),
    );
  }
}
