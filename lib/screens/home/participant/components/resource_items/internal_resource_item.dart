import 'package:flutter/material.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/screens/home/participant/components/resource_items/resource_item.dart';

class InternalResourceItem extends StatelessWidget {
  final ActionResource internalResource;

  const InternalResourceItem(this.internalResource, {super.key});

  void _openResource(BuildContext context) {
    switch (internalResource.action) {
      case ActionType.menu:
        // TODO: Handle this case.
        throw UnimplementedError();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ResourceItem(internalResource, onTap: () => _openResource(context));
  }
}
