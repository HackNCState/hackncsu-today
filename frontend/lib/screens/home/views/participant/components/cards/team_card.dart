import 'package:flutter/material.dart';
import 'package:hackncsu_today/screens/home/views/participant/components/cards/basic_card.dart';

class TeamCard extends StatelessWidget {
  const TeamCard({super.key});

  @override
  Widget build(BuildContext context) {
    return BasicCard(
      title: 'YOUR TEAM',
      helpText:
          'Information about your team such as members, assigned mentor, and judging.\nUpdates will appear automatically.',
    );
  }
}
