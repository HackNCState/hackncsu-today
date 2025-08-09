import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/streams/event_state_stream.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/basic_card.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/live_card_views/closing_ceremony_view.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/live_card_views/in_progress_view.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/live_card_views/initial_view.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/live_card_views/opening_ceremony_view.dart';

class LiveCard extends ConsumerWidget {
  const LiveCard({super.key});

  Widget _errorPlaceholder(String error, WidgetRef ref) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Error loading state: $error'),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () {
            ref.invalidate(eventStateStreamProvider);
          },
          child: const Text('Retry'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventState = ref.watch(eventStateStreamProvider);

    return BasicCard(
      title: 'LIVE',
      helpText:
          "Critical information such as the timer and other updates\nEnable desktop notifications to stay up to date even when you're in another tab.",
      color: Theme.of(context).colorScheme.primaryContainer,
      child: Center(
        child: eventState.when(
          data: (state) {
            if (state == null) {
              return Text("We're still setting things up, please stand by!");
            }

            return switch (state) {
              InitialEventState() => LiveCardInitialView(),
              InProgressEventState() => LiveCardInProgressView(),
              OpeningCeremonyEventState() => LiveCardOpeningCeremonyView(),
              ClosingCeremonyEventState() => LiveCardClosingCeremonyView(),
            };
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => _errorPlaceholder(error.toString(), ref),
        ),
      ),
    );
  }
}
