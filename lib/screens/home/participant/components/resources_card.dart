import 'package:flutter/material.dart';
import 'package:hackncsu_today/screens/home/participant/components/basic_card.dart';

class ResourcesCard extends StatelessWidget {
  const ResourcesCard({super.key});

  @override
  Widget build(BuildContext context) {
    return BasicCard(
      title: 'RESOURCES',
      helpText: 'A live-updating collection of Hack_NCState resources',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ResourceItem('Schedule', onTap: () {}),
          ResourceItem('Menu', onTap: () {}),
          ResourceItem('Opening Slides', onTap: () {}),
          ],
      ),
    );
  }
}

class ResourceItem extends StatelessWidget {
  final String title;
  final void Function()? onTap;

  const ResourceItem(this.title, {super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
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
              Icons.chevron_right,
              size: 20,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ],
        ),
      ),
    );
  }
}
