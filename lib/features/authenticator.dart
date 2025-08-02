import 'package:flutter/foundation.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/models/discord_user.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/services/discord_service.dart';
import 'package:hackncsu_today/services/firebase/auth_service.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:hackncsu_today/services/firebase/functions_service.dart';
import 'package:hackncsu_today/services/oauth_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'authenticator.g.dart';

@Riverpod(keepAlive: true)
class Authenticator extends _$Authenticator {
  // TODO: put in cloud func
  static const String _clientID = "1371413608394653736";

  @override
  AuthenticatorState build() {
    // try to log in automatically in the background
    _tryAutoLogin();
    return AutoAuthenticating();
  }

  /// takes our Discord authenticated user and uses it to log into Firebase
  /// that's where our actual user data is stored
  ///
  /// 1. call firebase function to verify user
  /// 2. call firebase auth to log in with custom token into the system
  /// 3. call firestore to sync user data
  /// 4. return user type (Organizer or Participant)
  /// TODO: create separate flow for email login if we do that lol
  Future<HackUser> _runFirebaseFlow(DiscordUser user) async {
    try {
      final functionsService = ref.read(firebaseFunctionsServiceProvider);
      final authService = ref.read(firebaseAuthServiceProvider);

      final response = await functionsService.verifyUser(user);
      await authService.login(response);

      final firestoreService = ref.read(firebaseFirestoreServiceProvider);
      return await firestoreService.createUserData(response);
    } on AppException catch (e) {
      throw VerificationException(e.message);
    }
  }

  Future<void> _tryAutoLogin() async {
    final oauth = await ref.read(
      oauthServiceProvider(_clientID, _clientSecret).future,
    );
    final firebaseAuth = ref.read(firebaseAuthServiceProvider);
    final firebaseFirestore = ref.read(firebaseFirestoreServiceProvider);

    try {
      // if firebase auth isn't null, we assume the user is already logged in (do partial firebase flow to get user data)
      // if firebase auth is null, try to relog using oauth credentials (do the whole firebase flow)
      // if that fails, we assume the user is unauthenticated and we clear the cache

      HackUser? existingUser;
      // this is ugly but it basically checks if the user is logged in with Firebase Auth
      // and if so, fetches their user data from Firestore. if it exists, we assume they are logged in
      // otherwise, we try the else if block.

      if (firebaseAuth.user != null &&
          (existingUser = (await firebaseFirestore.fetchUserData(
                firebaseAuth.user!.uid,
              ))) !=
              null) {
        if (kDebugMode) print("Auto-login successful with Firebase Auth.");

        state = Authenticated(user: existingUser!);
      } else if (await oauth.loadClientFromCache()) {
        if (kDebugMode) {
          print(
            "Couldn't load user from Firebase Auth. Retrying with OAuth credentials.",
          );
        }

        // cached client exists, now verify it by fetching user data
        final discord = await ref.read(
          discordServiceProvider(_clientID, _clientSecret).future,
        );

        final discordUser = await discord.fetchUser();
        final hackUser = await _runFirebaseFlow(discordUser);

        state = Authenticated(user: hackUser);

        if (kDebugMode) print("Auto-login successful.");
      } else {
        state = Unauthenticated();
        if (kDebugMode) {
          print(
            "Auto-login: No valid cached client found, manual log in required.",
          );
        }
      }
    } catch (e) {
      // any error during auto-login (e.g., token expired, network issue)
      // should result in Unauthenticated state.
      if (kDebugMode) print("Auto-login failed: $e");

      // but ensure potentially bad cache is cleared if error was due to it
      try {
        await oauth.clearCachedCredentialsAndClient();

        // Invalidate providers to ensure they are in a clean state for the next login attempt.
        ref.invalidate(oauthServiceProvider(_clientID, _clientSecret));
        ref.invalidate(discordServiceProvider(_clientID, _clientSecret));
      } catch (cleanupError) {
        if (kDebugMode) {
          print(
            "Error during cache cleanup after auto-login failure: $cleanupError",
          );
        }
      }

      state = Unauthenticated();
    }
  }

  Future<void> login() async {
    state = Authenticating(
      message: "Please continue logging into Discord in the other window.",
    );

    final oauth = await ref.read(
      oauthServiceProvider(_clientID, _clientSecret).future,
    );

    try {
      // will first try cache and then if not it will force interactive login
      await oauth.ensureOAuth2Client();

      state = Authenticating(
        message:
            "Hold on, we're just checking to see if you're a registered participant.",
      );

      final discord = await ref.read(
        discordServiceProvider(_clientID, _clientSecret).future,
      );

      final discordUser = await discord.fetchUser();
      final hackUser = await _runFirebaseFlow(discordUser);

      state = Authenticated(user: hackUser);
    } on VerificationException catch (e) {
      // user type could not be verified, so we assume they are unauthenticated
      state = AuthenticationError(error: VerificationException(e.message));
      await _handleLogoutAndCleanup();
    } on AppException catch (e) {
      state = AuthenticationError(error: e);
    } catch (e) {
      state = AuthenticationError(error: e);
    }
  }

  Future<void> logout() async {
    final authService = ref.read(firebaseAuthServiceProvider);

    await authService.logout();
    await _handleLogoutAndCleanup();
    state = Unauthenticated();
    if (kDebugMode) print("Logout successful.");
  }

  /// handles the logout process and cleans up any cached credentials.
  Future<void> _handleLogoutAndCleanup() async {
    try {
      final oauth = await ref.read(
        oauthServiceProvider(_clientID, _clientSecret).future,
      );
      await oauth.revokeTokenAndClearLocal();
      if (kDebugMode) print("Token revocation successful.");
    } catch (e) {
      if (kDebugMode) {
        print("Error during token revocation: $e");
      }
    }

    // Invalidate providers to ensure they are in a clean state for the next login attempt.
    ref.invalidate(oauthServiceProvider(_clientID, _clientSecret));
    ref.invalidate(discordServiceProvider(_clientID, _clientSecret));
  }
}

sealed class AuthenticatorState {}

class Unauthenticated extends AuthenticatorState {}

class Authenticating extends AuthenticatorState {
  final String message;

  Authenticating({this.message = "Authentication is in progress."});
}

class AutoAuthenticating extends AuthenticatorState {}

class AuthenticationError extends AuthenticatorState {
  final Object error;

  AuthenticationError({required this.error});
}

class Authenticated extends AuthenticatorState {
  final HackUser user;

  Authenticated({required this.user});
}

class VerificationException extends AppException {
  VerificationException(super.message);
}
