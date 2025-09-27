import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/screens/home/views/organizer/features/page_controller.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/screens/home/views/organizer/components/edit_resources_modal.dart';
import 'package:hackncsu_today/screens/home/views/organizer/components/editable_overlay.dart';
import 'package:hackncsu_today/screens/home/views/organizer/pages/tasks.dart';
import 'package:hackncsu_today/screens/home/views/participant/components/cards/live_card.dart';
import 'package:hackncsu_today/screens/home/views/participant/components/cards/resource_card.dart';

class OrganizerView extends ConsumerWidget {
  const OrganizerView({super.key});

  List<Widget> _cardsBuilder(BuildContext context) => [
    const SizedBox(height: 200, child: LiveCard()),
    SizedBox(
      height: 200,
      child: EditableOverlay(
        onEdit: () => _showEditResourcesModal(context, ResourceSource.internal),
        child: ResourceCard(ResourceSource.internal, showHidden: true),
      ),
    ),
    SizedBox(
      height: 200,
      child: EditableOverlay(
        onEdit: () => _showEditResourcesModal(context, ResourceSource.external),
        child: ResourceCard(ResourceSource.external, showHidden: true),
      ),
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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(organizerPageControllerProvider);

    return Row(
      children: [
        NavigationRail(
          labelType: NavigationRailLabelType.all,
          selectedIndex: state.index,
          onDestinationSelected: (index) {
            ref
                .read(organizerPageControllerProvider.notifier)
                .setPage(OrganizerPage.values[index]);
          },
          backgroundColor: Theme.of(context).colorScheme.surfaceContainer,
          destinations:
              OrganizerPage.values.map((page) {
                return NavigationRailDestination(
                  icon: Icon(page.icon),
                  label: Text(page.title),
                );
              }).toList(),
        ),
        Expanded(
          flex: 3,
          child: switch (state) {
            OrganizerPage.dashboard => Center(child: Text('Dashboard')),
            OrganizerPage.tasks => TasksPage(),
            OrganizerPage.teams => Center(child: Text('Teams')),
          },
        ),
        Expanded(child: ListView(children: _cardsBuilder(context))),
      ],
    );
  }
}
