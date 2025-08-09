import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/streams/event_state_stream.dart';
import 'package:hackncsu_today/screens/home/participant/components/cards/basic_card.dart';

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
      child: eventState.when(
        data: (state) {
          if (state == null) {
            return const Center(
              child: Text('No live updates available at the moment.'),
            );
          }
          return Center(child: Text(state.toString()));
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _errorPlaceholder(error.toString(), ref),
      ),
    );
  }
}
