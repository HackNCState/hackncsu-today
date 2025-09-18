import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'event_state_stream.g.dart';

@riverpod
Stream<EventState?> eventStateStream(Ref ref) {
  final firestoreService = ref.watch(firebaseFirestoreServiceProvider);
  return firestoreService.streamEventState();
}

Stream<Duration> _countdownStream(DateTime to) async* {
  yield to.difference(DateTime.now()).isNegative
      ? Duration.zero
      : to.difference(DateTime.now());

  final ticker = Stream.periodic(const Duration(seconds: 1));

  await for (final _ in ticker) {
    final now = DateTime.now();
    final difference = to.difference(now);

    if (difference.isNegative) {
      yield Duration.zero;
      break;
    } else {
      yield difference;
    }
  }
}

@riverpod
Stream<Duration?> inProgressCountdownStream(Ref ref) async* {
  final eventState = await ref.watch(eventStateStreamProvider.future);

  if (eventState is InProgressEventState) {
    yield* _countdownStream(eventState.endTime);
  } else {
    yield null;
  }
}
