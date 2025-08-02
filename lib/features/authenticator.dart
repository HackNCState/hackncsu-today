import 'package:flutter/foundation.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/services/firebase/auth_service.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:hackncsu_today/services/oauth_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'authenticator.g.dart';

@Riverpod(keepAlive: true)
class Authenticator extends _$Authenticator {
  @override
  AuthenticatorState build() {
    // try to log in automatically in the background
    _tryAutoLogin();
    return AutoAuthenticating();
  }

  Future<void> _tryAutoLogin() async {
    final firebaseAuth = ref.read(firebaseAuthServiceProvider);
    final firebaseFirestore = ref.read(firebaseFirestoreServiceProvider);

    try {
      // if firebase auth isn't null, we assume the user is already logged in (get user data from Firestore)
      // if firebase auth is null, they must log in again

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

        return;
      } else {
        if (kDebugMode) {
          print(
            "Auto-login: Manual log in required.",
          );
        }
      }
    } catch (e) {
      // any error during auto-login 
      if (kDebugMode) print("Auto-login failed: $e");
    }

    await Future.delayed(
      const Duration(seconds: 1),
    ); // wait a bit because idk it doesn't work without it

    state = Unauthenticated();
  }

  Future<void> login() async {
    state = Authenticating(
      message: "Please continue logging into Discord in the other window.",
    );

    final oauthService = ref.read(oauthServiceProvider);
    final firestoreService = ref.read(firebaseFirestoreServiceProvider);
    final authService = ref.read(firebaseAuthServiceProvider);

    try {
      final response = await oauthService.authenticate();

      state = Authenticating(
        message:
            "We are now logging you in. Please wait a moment.",
      );

      await authService.login(response);
      final hackUser = await firestoreService.createUserData(response);

      state = Authenticated(user: hackUser);
    } on AppException catch (e) {
      state = AuthenticationError(error: e);
    } catch (e) {
      state = AuthenticationError(error: e);
    }
  }

  Future<void> logout() async {
    final authService = ref.read(firebaseAuthServiceProvider);

    await authService.logout();
    state = Unauthenticated();
    if (kDebugMode) print("Logout successful.");
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

