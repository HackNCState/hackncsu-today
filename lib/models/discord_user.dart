import 'package:freezed_annotation/freezed_annotation.dart';

part 'discord_user.freezed.dart';
part 'discord_user.g.dart';

/// a Discord user model that represents a user in Discord.
@freezed
abstract class DiscordUser with _$DiscordUser {
  const factory DiscordUser({
    required String id,
    required String username,
    required String avatar,
  }) = _DiscordUser;

  factory DiscordUser.fromJson(Map<String, Object?> json) =>
      _$DiscordUserFromJson(json);
}
