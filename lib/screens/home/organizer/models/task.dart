import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'task.freezed.dart';

@freezed
sealed class Task with _$Task {
  const Task._();

  const factory Task({
    required String title,
    required String content,
    List<TaskParameter> Function(WidgetRef)?
    parameters, // TODO: make this a builder
    required Future<void> Function(WidgetRef, List<TaskParameter>) onExecute,
  }) = _Task;
}

@freezed
sealed class TaskParameter with _$TaskParameter {
  const TaskParameter._();
  const factory TaskParameter.string(String description, String value) =
      StringTaskParameter;
  const factory TaskParameter.integer(String description, int value) =
      IntegerTaskParameter;
  const factory TaskParameter.boolean(String description, bool value) =
      BooleanTaskParameter;
  const factory TaskParameter.doubleValue(String description, double value) =
      DoubleTaskParameter;
  const factory TaskParameter.dateTime(String description, DateTime value) =
      DateTimeTaskParameter;
}
