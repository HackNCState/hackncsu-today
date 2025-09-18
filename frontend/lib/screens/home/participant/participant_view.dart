import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/config/constants.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/checklist_card.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/resource_card.dart';
import 'package:hackncsu_today/screens/home/participant/components/discord_embed.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/live_card.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/team_card.dart';
import 'package:responsive_framework/responsive_framework.dart';

class ParticipantView extends ConsumerWidget {
  final Participant participant;

  const ParticipantView(this.participant, {super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDesktop = ResponsiveBreakpoints.of(context).isDesktop;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            flex: 2,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Expanded(child: LiveCard()),
                      Expanded(flex: 2, child: TeamCard()),
                    ],
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: DiscordEmbed(
                    serverID: kDiscordServerId,
                    channelID: kDiscordChannelId,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(child: ChecklistCard()),
                Expanded(child: ResourceCard(ResourceSource.internal)),
                Expanded(child: ResourceCard(ResourceSource.external)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
