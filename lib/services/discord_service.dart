// service for interfacing w/ discord api to get pfp and all that

import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/models/discord_user.dart';
import 'package:hackncsu_today/services/oauth_service.dart';
import 'package:oauth2/oauth2.dart' as oauth2;
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'discord_service.g.dart';

@Riverpod(keepAlive: true)
Future<DiscordService> discordService(Ref ref, String clientID, String clientSecret) async {
  final oauth = await ref.watch(oauthServiceProvider(clientID, clientSecret).future);

  return DiscordService(client: oauth.client);

}

class DiscordService {
  static const String _baseUrl = "https://discord.com/api";

  static final Uri _meUrl = Uri.parse("$_baseUrl/users/@me");

  final oauth2.Client client;

  const DiscordService({required this.client});

  Future<DiscordUser> fetchUser() async {
    final response = await client.get(_meUrl);

    if (response.statusCode != 200) throw ResponseException("error ${response.statusCode}: ${response.body}");

    return DiscordUser.fromJson(jsonDecode(response.body));
  }
}

class ResponseException extends AppException {
  const ResponseException(super.message);
}