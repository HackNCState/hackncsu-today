import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'event_data_stream.g.dart';

@riverpod
Stream<EventData?> eventDataStream(Ref ref) {
  final firestoreService = ref.watch(firebaseFirestoreServiceProvider);
  return firestoreService.streamEventData();
}
