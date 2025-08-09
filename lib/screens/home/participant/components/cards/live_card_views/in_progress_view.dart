import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/streams/event_state_stream.dart';
import 'package:hackncsu_today/models/event/event_state.dart';

class LiveCardInProgressView extends ConsumerWidget {
  const LiveCardInProgressView({super.key});

  Widget _countdownBuilder(Duration countdown) {
    final hours = countdown.inHours;
    final minutes = (countdown.inMinutes % 60);
    final seconds = (countdown.inSeconds % 60);

    return Text(
      'Time left: ${hours.toString().padLeft(2, '0')}:'
      '${minutes.toString().padLeft(2, '0')}:'
      '${seconds.toString().padLeft(2, '0')}',
      style: const TextStyle(fontSize: 24),
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

        return _countdownBuilder(duration);
      },
      loading: () => CircularProgressIndicator(),
      error: (_, _) => _nullBuilder(),
    );
  }
}
