import 'package:flutter/material.dart';
import 'package:hackncsu_today/models/event/event_data.dart';

class ResourceItem extends StatelessWidget {
  final Resource resource;
  final IconData icon;
  final void Function()? onTap;

  const ResourceItem(this.resource, {super.key, this.onTap, this.icon = Icons.chevron_right});

  Widget _itemBuilder(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                resource.name,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ),
            Icon(
              icon,
              size: 20,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ],
        ),
      ),
    );
  }

  Widget _hiddenItemBuilder(BuildContext context) {
    return Stack(
      children: [
        _itemBuilder(context),

        Align(
          alignment: Alignment.topRight,
          child: IgnorePointer(
            child: Container(
              color: Colors.black.withAlpha(150),
              child: Text(
                'HIDDEN TO PARTICIPANTS',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: Colors.white.withAlpha(255),
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.right,
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return resource.hidden
        ? _hiddenItemBuilder(context)
        : _itemBuilder(context);
  }
}
