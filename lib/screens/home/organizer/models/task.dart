import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'task.freezed.dart';

@freezed
sealed class Task with _$Task {
  const Task._();

  const factory Task({
    required String title,
    required String content,
    required Future<void> Function(WidgetRef) onExecute,
  }) = _Task;
}