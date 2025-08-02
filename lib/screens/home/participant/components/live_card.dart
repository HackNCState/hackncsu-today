import 'package:flutter/material.dart';
import 'package:hackncsu_today/screens/home/participant/components/basic_card.dart';

class LiveCard extends StatelessWidget {
  const LiveCard({super.key});

  @override
  Widget build(BuildContext context) {
    return BasicCard(
      title: "LIVE",
      color: Theme.of(context).colorScheme.primaryContainer,
      child: Text("Live Card"),
    );
  }
}
