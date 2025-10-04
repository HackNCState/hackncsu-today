// service for performing oauth2 handshake

import 'dart:async';
import 'dart:convert';
import 'dart:js_interop';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/services/firebase/functions_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:web/web.dart';

part 'oauth_service.g.dart';

@riverpod
OAuthService oauthService(Ref ref) {
  return OAuthService();
}

class OAuthService {
  static const String _clientID = '1371413608394653736';
  static const String _baseUrl =
      'discord.com';
  static const String _authorizationEndpoint =
      '/api/oauth2/authorize';

  static final String _redirectUrl = kDebugMode
        ? 'http://127.0.0.1:5001/hackncsu-today/us-central1/oauth_callback'
        : 'https://us-central1-hackncsu-today.cloudfunctions.net/oauth_callback';
  // TODO: https://stackoverflow.com/questions/49825799/use-custom-domain-for-firebase-function-http-calls

  /// performs interactive oauth2 flow
  /// and returns a standard auth response
  Future<AuthenticateFunctionResponse> authenticate() async {
    final authUrl = Uri.https(_baseUrl, _authorizationEndpoint, {
      'client_id': _clientID,
      'redirect_uri': _redirectUrl,
      'response_type': 'code',
      'scope': 'identify',
      'state': DateTime.timestamp().millisecondsSinceEpoch.toString(),
    });

    final authWindow = window.open(
      authUrl.toString(),
      'Discord Sign In',
      'opener=1,width=500,height=800',
    );

    if (authWindow == null) {
      throw OAuthRedirectException(
        'Failed to open authentication window. Please ensure popups are not blocked.',
      );
    }

    final completer = Completer<AuthenticateFunctionResponse>();
    final timer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (authWindow.closed == true) {
        timer.cancel();
        if (!completer.isCompleted) {
          completer.completeError(
            OAuthRedirectException('Authentication was canceled.'),
          );
        }
      }
    });

    final StreamSubscription<MessageEvent>
    messageSubscription = window.onMessage.listen((event) {
      if (event.data.isA<JSString>() && !completer.isCompleted) {
        try {
          final jsonString = (event.data as JSString).toDart;
          final responseMap = jsonDecode(jsonString) as Map<String, dynamic>;

          if (responseMap['status'] == 'success') {
            final data = responseMap['data'] as Map<String, dynamic>;
            final authResponse = AuthenticateFunctionResponse.fromJson(data);
            completer.complete(authResponse);

          } else {
            final error = responseMap['error'] as Map<String, dynamic>;
            final message = error['message'] as String;

            completer.completeError(
              FirebaseFunctionException(message),
            );
          }
        } catch (e) {
          completer.completeError(
            OAuthRedirectException(
              'Failed to parse authentication response: $e',
            ),
          );
        }
      }
    });

    try {
      return await completer.future.timeout(const Duration(minutes: 3));
    } on TimeoutException {
      throw OAuthRedirectException('Authentication timed out.');
    } finally {
      timer.cancel();
      messageSubscription.cancel();
      if (!authWindow.closed) {
        authWindow.close();
      }
    }
  }
}

class UnauthenticatedException extends AppException {
  const UnauthenticatedException()
    : super('OAuth2 client accessed without first authenticating');
}

class OAuthRedirectException extends AppException {
  const OAuthRedirectException(super.message);
}
