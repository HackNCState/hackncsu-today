
import 'package:freezed_annotation/freezed_annotation.dart';

part 'event_state.freezed.dart';
part 'event_state.g.dart';

@Freezed(unionKey: 'type')
sealed class EventState with _$EventState {
  const EventState._();

  @FreezedUnionValue('initial')
  const factory EventState.initial() = InitialEventState;

  factory EventState.fromJson(Map<String, Object?> json) =>
      _$EventStateFromJson(json);
}