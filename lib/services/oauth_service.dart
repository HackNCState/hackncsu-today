// service for performing oauth2 handshake

import 'dart:async';
import 'dart:js_interop';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/services/hive_service.dart';
import 'package:hive_ce/hive.dart';
import 'package:oauth2/oauth2.dart' as oauth2;
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:web/web.dart';

part 'oauth_service.g.dart';

@Riverpod(keepAlive: true)
Future<OAuthService> oauthService(
  Ref ref,
  String clientID,
  String clientSecret,
) async {
  final oauthBox = await Hive.openBox(HiveService.oauth2Cache);
  final oauth = OAuthService(clientID, clientSecret, cache: oauthBox);

  ref.onDispose(() async {
    oauth.dispose();

    if (kDebugMode) print("Disposed of OAuthService");
  });

  // await oauth.authenticate();

  return oauth;
}

class OAuthService {
  static const String _cachedCredentials = "cached_credentials";

  static final Uri _redirectUrl = Uri.parse(
    kDebugMode
        ? "http://localhost:8080/auth.html"
        : "https://today.hackncstate.org/auth.html",
  );

  static final Uri _authorizationEndpoint = Uri.parse(
    "https://discord.com/oauth2/authorize",
  );
  static final Uri _tokenEndpoint = Uri.parse(
    "https://discord.com/api/oauth2/token",
  );
  static final Uri _revokeEndpoint = Uri.parse(
    "https://discord.com/api/oauth2/token/revoke",
  );

  final String clientID;
  final String clientSecret;
  final Box _cache;

  oauth2.Client? _client;

  /// will throw if unauthenticated
  oauth2.Client get client {
    if (_client == null) throw UnauthenticatedException();

    return _client!;
  }

  OAuthService(this.clientID, this.clientSecret, {required Box<dynamic> cache})
    : _cache = cache;

  /// try to obtain a client from cache, returns true if success
  Future<bool> loadClientFromCache() async {
    if (_client != null) return true; // already have client

    if (_cache.containsKey(_cachedCredentials)) {
      try {
        _client = _fetchCachedClient();
        if (kDebugMode) print("OAuth client loaded from cache.");
        return true;
      } catch (e) {
        if (kDebugMode) {
          print("Failed to load client from cache (invalid format?): $e");
        }
        await clearCachedCredentialsAndClient(); // clear potentially corrupt data
        return false;
      }
    }

    return false;
  }

  /// ensure there is an oauth2 client, first via cache then if not w/ interactive login
  Future<void> ensureOAuth2Client() async {
    if (_client != null) return;

    bool loadedFromCache = await loadClientFromCache();

    if (loadedFromCache) return;

    if (kDebugMode) {
      print(
        "No valid cached client, proceeding to interactive authentication.",
      );
    }
    _client = await _createClientInteractive();
  }

  // closes client and removes cached credentials
  Future<void> clearCachedCredentialsAndClient() async {
    _client?.close();
    _client = null;
    if (_cache.isOpen) {
      await _cache.delete(_cachedCredentials);
    }
    if (kDebugMode) print("Cleared cached OAuth credentials and client.");
  }

  // performs interactive oauth2 flow, saves to cache
  Future<oauth2.Client> _createClientInteractive() async {
    final grant = oauth2.AuthorizationCodeGrant(
      clientID,
      _authorizationEndpoint,
      _tokenEndpoint,
      secret: clientSecret,
      onCredentialsRefreshed: (credentials) {
        if (kDebugMode) {
          print("OAuth client credentials refreshed, cache updated.");
        }
        _saveCache(credentials);
      },
    );

    final authUrl = grant.getAuthorizationUrl(
      _redirectUrl,
      scopes: ["identify"],
      state: DateTime.timestamp().millisecondsSinceEpoch.toString(),
    );

    final authWindow = window.open(authUrl.toString(), "", "opener=1");

    if (authWindow == null) {
      throw OAuthRedirectException(
        "Failed to open authentication window. Please ensure popups are not blocked for this site.",
      );
    }

    final Timer windowClosedTimer = Timer.periodic(
      const Duration(milliseconds: 500),
      (timer) {
        if (authWindow.closed == true) {
          timer.cancel();
          window.postMessage("cancel".jsify());
        }
      },
    );

    final responseUrl = await _listen(_redirectUrl, authWindow);

    windowClosedTimer.cancel();

    final client = await grant.handleAuthorizationResponse(
      responseUrl.queryParameters,
    );

    _saveCache(client.credentials);

    return client;
  }

  /// revokes access token and clears cache
  Future<void> revokeTokenAndClearLocal() async {
    if (_client != null) {
      try {
        final response = await _client!.post(
          _revokeEndpoint,
          body: {
            'client_id': clientID,
            'client_secret': clientSecret,
            'token': _client!.credentials.accessToken,
          },
        );
        if (response.statusCode != 200) {
          if (kDebugMode) print("Token revocation failed: ${response.body}");
        } else {
          if (kDebugMode) print("Token revoked successfully on server.");
        }
      } catch (e) {
        if (kDebugMode) print("Error during token revocation request: $e");
      }
    }
    await clearCachedCredentialsAndClient(); // clear local state
  }

  /// save cache and dispose of client. does not do anything if already disposed
  Future<void> dispose() async {
    if (_client != null && _cache.isOpen) {
      _saveCache(_client!.credentials);
      _client!.close();
      _client = null;
    }
  }

  // save credentials to cache if box open
  Future<void> _saveCache(oauth2.Credentials credentials) async {
    if (_cache.isOpen) {
      await _cache.put(_cachedCredentials, credentials.toJson());
    }
  }

  oauth2.Client _fetchCachedClient() {
    final credentials = oauth2.Credentials.fromJson(
      _cache.get(_cachedCredentials),
    );
    return oauth2.Client(
      credentials,
      identifier: clientID,
      secret: clientSecret,
    );
  }

  /// listen and handle discord popup tab
  Future<Uri> _listen(Uri expectedRedirectUrl, Window authWindow) async {
    try {
      await for (final event in window.onMessage.timeout(
        const Duration(minutes: 5),
      )) {
        if (event.origin != window.location.origin) {
          if (kDebugMode) {
            print(
              "OAuthService _listen: Received message from unexpected origin ${event.origin}. Ignoring.",
            );
          }
          continue;
        }

        final data = event.data;

        if (data.isA<JSString>()) {
          final href = (data as JSString).toDart;

          if (href.toLowerCase() == "cancel") {
            if (kDebugMode) {
              print("OAuthService _listen: Auth canceled by user");
            }
            throw OAuthRedirectException("Authentication was canceled.");
          }

          if (href.startsWith(expectedRedirectUrl.toString())) {
            return Uri.parse(href);
          } else {
            if (kDebugMode) {
              print(
                "OAuthService _listen: Received href '$href' which does not start with expected prefix '$expectedRedirectUrl'. Ignoring.",
              );
            }
          }
        } else {
          if (kDebugMode) {
            print(
              "OAuthService _listen: Received data of unexpected type: ${data.runtimeType}. Expected JSString. Ignoring.",
            );
          }
        }
      }

      throw OAuthRedirectException(
        "Authentication message stream ended before a valid redirect was received.",
      );
    } on TimeoutException {
      throw OAuthRedirectException(
        "Authentication timed out waiting for redirect message from popup.",
      );
    } catch (e) {
      if (e is OAuthRedirectException) rethrow;

      if (kDebugMode) {
        print("OAuthService _listen: Unexpected error: $e");
      }
      throw OAuthRedirectException(
        "An unexpected error occurred while listening for authentication redirect: ${e.toString()}",
      );
    }
  }
}

class UnauthenticatedException extends AppException {
  const UnauthenticatedException()
    : super("OAuth2 client accessed without first authenticating");
}

class OAuthRedirectException extends AppException {
  const OAuthRedirectException(super.message);
}
