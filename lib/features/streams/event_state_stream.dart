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

Stream<Duration> _countdownStream(DateTime to) {
  if (to.isBefore(DateTime.now())) {
    return Stream.value(Duration.zero);
  }

  return Stream.periodic(const Duration(seconds: 1), (_) {
    final now = DateTime.now();
    final difference = to.difference(now);

    return difference.isNegative ? Duration.zero : difference;
  }).takeWhile((duration) => duration != Duration.zero);
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
