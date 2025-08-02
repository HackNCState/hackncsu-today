import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/services/firebase/functions_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_service.g.dart';

@riverpod
FirebaseAuthService firebaseAuthService(Ref ref) {
  return FirebaseAuthService();
}

class FirebaseAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  User? get user => _auth.currentUser;

  /// authenticates the user with firebase using the token returned from the
  /// firebase function that checks if the user is registered for the hackathon.
  /// this way, one can only access the firebase database if they are registered.
  Future<void> login(AuthenticateFunctionResponse response) async {
    final credentials = await _auth.signInWithCustomToken(response.token);

    final user = credentials.user;

    if (user == null) {
      throw FirebaseAuthException(
        'Failed to sign in with custom token. User is null.',
      );
    }

    if (user.displayName == null) {
      await user.updateDisplayName(
        '${response.firstName} ${response.lastName} (${response.username})',
      );
    }

    if (kDebugMode) {
      print('User logged in: ${response.firstName} ${response.lastName} (${response.username})');
    }
  }

  /// logs out the user from firebase
  Future<void> logout() async {
    try {
      await _auth.signOut();
      if (kDebugMode) print('User logged out successfully.');
    } catch (e) {
      throw FirebaseAuthException('Failed to log out: ${e.toString()}');
    }
  }
}

class FirebaseAuthException extends AppException {
  const FirebaseAuthException(super.message);
}
