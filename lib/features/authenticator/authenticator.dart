import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/features/streams/hack_user_stream.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/services/firebase/auth_service.dart';
import 'package:hackncsu_today/services/firebase/firestore_service.dart';
import 'package:hackncsu_today/services/oauth_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'authenticator.g.dart';

@Riverpod(keepAlive: true)
class Authenticator extends _$Authenticator {
  ProviderSubscription<AsyncValue<HackUser?>>? _userListenerSubscription;

  @override
  AuthenticatorState build() {
    // try to log in automatically in the background
    _autoLogin();
    return AutoAuthenticating();
  }

  Future<void> _autoLogin() async {
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
          (existingUser = (await firebaseFirestore.fetchUser(
                firebaseAuth.user!.uid,
              ))) !=
              null) {
        if (kDebugMode) print('Auto-login successful with Firebase Auth.');

        state = Authenticated(user: existingUser!);
        _listenForUserUpdates(existingUser);

        return;
      } else {
        if (kDebugMode) {
          print('Auto-login: Manual log in required.');
        }
      }
    } catch (e) {
      // any error during auto-login
      if (kDebugMode) print('Auto-login failed: $e');
    }

    await Future.delayed(
      const Duration(seconds: 1),
    ); // wait a bit because idk it doesn't work without it
    // TODO: fix fragility

    state = Unauthenticated();
  }

  /// Listens to the user stream and updates state whenever user data changes
  /// force logs out if user data disappears
  void _listenForUserUpdates(HackUser user) {
    _userListenerSubscription?.close();

    if (kDebugMode) print('Starting auto-update for user data...');
    _userListenerSubscription = ref.listen(hackUserStreamProvider(user.id), (
      previous,
      next,
    ) {
      next.when(
        data: (userData) {
          if (state is Authenticated &&
              previous != next &&
              (previous?.hasValue ?? false)) {
            if (userData != null) {
              if (kDebugMode) {
                print('User data auto-updating...');
              }
              state = Authenticated(user: userData);
            } else {
              if (kDebugMode) {
                print('User data is null in auto update. Forcing logout...');
              }
              logout();
            }
          }
        },
        loading: () {},
        error: (error, stack) {
          state = AuthenticationError(error: error);
          if (kDebugMode) print('Error during user data auto update: $error');
        },
      );
    });
  }

  Future<void> login() async {
    state = Authenticating(
      message: 'Please continue logging into Discord in the other window.',
    );

    final oauthService = ref.read(oauthServiceProvider);
    final firestoreService = ref.read(firebaseFirestoreServiceProvider);
    final authService = ref.read(firebaseAuthServiceProvider);

    try {
      final response = await oauthService.authenticate();

      state = Authenticating(
        message: 'We are now logging you in. Please wait a moment.',
      );

      await authService.login(response);
      final hackUser = await firestoreService.createUser(response);

      state = Authenticated(user: hackUser);
      _listenForUserUpdates(hackUser);
    } on AppException catch (e) {
      state = AuthenticationError(error: e);
    } catch (e) {
      state = AuthenticationError(error: e);
    }
  }

  Future<void> logout() async {
    final authService = ref.read(firebaseAuthServiceProvider);

    _userListenerSubscription?.close();
    _userListenerSubscription = null;
    await authService.logout();
    state = Unauthenticated();
    if (kDebugMode) print('Logout successful.');
  }

  /// Switches the user type for debugging purposes.
  Future<void> debugSetUserType(String type) async {
    if (kDebugMode) {
      _userListenerSubscription?.close();

      final firestore = ref.read(firebaseFirestoreServiceProvider);
      final auth = ref.read(firebaseAuthServiceProvider);

      final userId = auth.user!.uid;

      await firestore.debugSetUserType(userId, type).catchError((error) {
        state = AuthenticationError(error: error);
        if (kDebugMode) print('Failed to switch view: $error');
      });

      final user = (await firestore.fetchUser(userId))!;

      state = Authenticated(user: user);

      _listenForUserUpdates(user);
    }
  }
}

sealed class AuthenticatorState {}

class Unauthenticated extends AuthenticatorState {}

class Authenticating extends AuthenticatorState {
  final String message;

  Authenticating({this.message = 'Authentication is in progress.'});
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
