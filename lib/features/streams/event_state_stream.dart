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
