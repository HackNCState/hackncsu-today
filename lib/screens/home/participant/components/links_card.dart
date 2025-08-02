import 'package:flutter/material.dart';
import 'package:hackncsu_today/screens/home/participant/components/basic_card.dart';
import 'package:url_launcher/url_launcher.dart';

class LinksCard extends StatelessWidget {
  const LinksCard({super.key});

  @override
  Widget build(BuildContext context) {
    return BasicCard(
      title: "LINKS",
      helpText: "Useful links to external resources",
      child: ListView(
        children: [
          LinkItem("HackNC State Website", "https://hackncstate.com"),
          LinkItem("HackNC State Discord", "https://discord.gg/hackncstate"),
          LinkItem(
            "Map of Centennial Campus",
            "https://www.ncsu.edu/campus_map/",
          ),
          LinkItem("Contact Us", "https://hackncstate.com/contact"),
        ],
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
