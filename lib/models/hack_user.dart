import 'package:freezed_annotation/freezed_annotation.dart';

part 'hack_user.freezed.dart';
part 'hack_user.g.dart';

/// Represents a user in the HackNCSU system, which can be either an organizer or a participant.
@Freezed(unionKey: 'type')
sealed class HackUser with _$HackUser {
  const HackUser._();

  // TODO: probably will need to somehow verify w cf worker to ensure client side doesnt spoof organizer
  @FreezedUnionValue('organizer')
  const factory HackUser.organizer({required String id}) = Organizer;

  @FreezedUnionValue('participant')
  const factory HackUser.participant({
    required String id,
    required String firstName,
    required String lastName,
    required String? phone,
    required String? email,
    required List<String> dietaryRestrictions,
    required String? shirtSize,
    required List<String> eventsAttended,
    required bool hadFirstLunch,
    required bool hadDinner,
    required bool hadBreakfast,
    required bool hadSecondLunch,
  }) = Participant;

  factory HackUser.fromJson(Map<String, Object?> json) =>
      _$HackUserFromJson(json);
}
