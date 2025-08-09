import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/streams/event_state_stream.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/models/extensions/duration.dart';

class LiveCardInProgressView extends ConsumerWidget {
  const LiveCardInProgressView({super.key});

  Widget _countdownBuilder(BuildContext context, Duration countdown) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          countdown.toFormattedString(),
          style: Theme.of(
            context,
          ).textTheme.displayMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        Text(
          'Hack_NCState is in progress!',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ],
    );
  }

  Widget _nullBuilder() {
    return const Text('No countdown available. Is the event in progress?');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final countdown = ref.watch(inProgressCountdownStreamProvider);

    return countdown.when(
      data: (duration) {
        if (duration == null) {
          return _nullBuilder();
        }

        return _countdownBuilder(context, duration);
      },
      loading: () => CircularProgressIndicator(),
      error: (_, _) => _nullBuilder(),
    );
  }
}
