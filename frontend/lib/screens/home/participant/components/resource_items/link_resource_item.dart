import 'package:flutter/material.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/screens/home/participant/components/resource_items/resource_item.dart';
import 'package:url_launcher/url_launcher.dart';

class LinkResourceItem extends StatelessWidget {
  final LinkResource linkResource;

  const LinkResourceItem(this.linkResource, {super.key});

  @override
  Widget build(BuildContext context) {
    return ResourceItem(
      linkResource,
      icon: Icons.open_in_new,
      onTap: () {
        launchUrl(Uri.parse(linkResource.url), webOnlyWindowName: '_blank');
      },
    );
  }
}
