import 'package:flutter/material.dart';
import 'package:hackncsu_today/screens/home/views/participant/components/cards/basic_card.dart';

class ChecklistCard extends StatelessWidget {
  const ChecklistCard({super.key});

  @override
  Widget build(BuildContext context) {
    return BasicCard(
      title: 'CHECKLIST',
      helpText:
          'Checklist to keep track of important tasks during the event, and even add your own tasks.\nChanges are synced with your team members.',
      child: Stack(
        children: [
          ListView(
            children: [
              CheckboxListTile(
                value: false,
                onChanged: (_) {},
                title: Text('Check in at the registration desk'),
              ),
              CheckboxListTile(
                value: false,
                onChanged: (_) {},
                title: Text('Join the HackNC State Discord server'),
              ),
              CheckboxListTile(
                value: false,
                onChanged: (_) {},
                title: Text('Join your team channel on Discord'),
              ),
              CheckboxListTile(
                value: false,
                onChanged: (_) {},
                title: Text('Attend the opening ceremony'),
              ),
              CheckboxListTile(
                value: false,
                onChanged: (_) {},
                title: Text('Attend the workshops'),
              ),
              CheckboxListTile(
                value: false,
                onChanged: (_) {},
                title: Text('Submit your project on Devpost'),
              ),
              SizedBox(height: 32), // Add some space at the bottom
            ],
          ),
          Align(
            alignment: Alignment.bottomRight,
            child: IconButton.filled(
              onPressed: () {},
              icon: const Icon(Icons.add),
            ),
          ),
        ],
      ),
    );
  }
}
