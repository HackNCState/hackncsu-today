import 'package:freezed_annotation/freezed_annotation.dart';

part 'event_state.freezed.dart';
part 'event_state.g.dart';

@Freezed(unionKey: 'type')
sealed class EventState with _$EventState {
  const EventState._();

  @FreezedUnionValue('initial')
  const factory EventState.initial({String? announcement}) = InitialEventState;

  @FreezedUnionValue('standby')
  const factory EventState.standby({String? announcement}) = StandbyEventState;

  @FreezedUnionValue('openingCeremony')
  const factory EventState.openingCeremony({String? announcement}) =
      OpeningCeremonyEventState;

  @FreezedUnionValue('inProgress')
  const factory EventState.inProgress({
    required DateTime startTime,
    required DateTime endTime,
    String? announcement,
  }) = InProgressEventState;

  @FreezedUnionValue('closingCeremony')
  const factory EventState.closingCeremony({String? announcement}) =
      ClosingCeremonyEventState;

  factory EventState.fromJson(Map<String, Object?> json) =>
      _$EventStateFromJson(json);
}
