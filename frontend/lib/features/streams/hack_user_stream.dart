import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'hack_user_stream.g.dart';

@riverpod
Stream<HackUser?> hackUserStream(Ref ref, String userId) {
  final firestoreService = ref.watch(firebaseFirestoreServiceProvider);
  return firestoreService.streamUser(userId);
}