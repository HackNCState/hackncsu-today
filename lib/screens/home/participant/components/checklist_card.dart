import 'package:flutter/material.dart';
import 'package:hackncsu_today/screens/home/participant/components/basic_card.dart';

class ChecklistCard extends StatelessWidget {
  const ChecklistCard({super.key});

  @override
  Widget build(BuildContext context) {
    return BasicCard(
      title: 'CHECKLIST',
      helpText:
          'A checklist to guide you through the event\nThis is synced with your teammates',
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
