import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/models/discord_user.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'functions_service.g.dart';
part 'functions_service.freezed.dart';

@riverpod
FirebaseFunctionsService firebaseFunctionsService(Ref ref) {
  return FirebaseFunctionsService();
}

class FirebaseFunctionsService {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;

  static const String _verifyUserEndpoint = 'authenticate';
  static const String _fetchUserEndpoint = 'fetchUser';

  /// calls a firebase function that checks if our discord user is registered for
  /// the hackathon. if so, we can use the returned token to authenticate with firebase
  /// which will allow them to securely access the firebase database...
  /// also it lets us know if they are an organizer or not
  Future<AuthenticateFunctionResponse> verifyUser(DiscordUser user) async {
    try {
      final callable = _functions.httpsCallable(_verifyUserEndpoint);
      final response = await callable.call<RawFirebaseFunctionResponse?>({
        'discordId': user.id,
        'discordUsername': user.username,
      });

      if (response.data != null) {
        return AuthenticateFunctionResponse.fromJson(response.data!);
      } else {
        throw FirebaseFunctionException(
          'Authentication failed: No data returned',
        );
      }
    } on FirebaseFunctionsException catch (e) {
      switch (e.code) {
        case "unauthenticated":
          throw FirebaseFunctionException(
            "This Discord account is not associated with a registered participant.\nLet a staff member know if you think this is a mistake.",
          );
        case "permission-denied":
          throw FirebaseFunctionException(
            "You're a participant but it seems you haven't checked in yet!\nPlease check in at the registration desk or let a staff member know if you think this is a mistake.",
          );
        default:
          throw FirebaseFunctionException(
            'Failed to verify user: ${e.message}',
          );
      }
    }
  }

  /// fetches the user document from Firestore with the given user ID.
  /// returns only limited fields (name, last name, id) for public access.
  /// if the user is an organizer, it throws an exception.
  /// if the user is not found, it returns null.
  Future<FetchUserFunctionResponse?> fetchUser(String id) async {
    try {
      final callable = _functions.httpsCallable(_fetchUserEndpoint);
      final response = await callable.call<RawFirebaseFunctionResponse?>({
        'id': id,
      });

      if (response.data != null) {
        return FetchUserFunctionResponse.fromJson(response.data!);
      } else {
        return null;
      }
    } on FirebaseFunctionsException catch (e) {
      throw FirebaseFunctionException(
        'Failed to fetch user data: ${e.message}',
      );
    }
  }
}

typedef RawFirebaseFunctionResponse = Map<String, Object?>;

@freezed
abstract class AuthenticateFunctionResponse
    with _$AuthenticateFunctionResponse {
  AuthenticateFunctionResponse._();

  factory AuthenticateFunctionResponse({
    required String token,
    required String id,
    required String username,
    required String? firstName,
    required String? lastName,
    required String? phone,
    required String? email,
    required bool isOrganizer,
  }) = _AuthenticateFunctionResponse;

  factory AuthenticateFunctionResponse.fromJson(Map<String, Object?> json) =>
      _$AuthenticateFunctionResponseFromJson(json);
}

@freezed
abstract class FetchUserFunctionResponse
    with _$FetchUserFunctionResponse {
  FetchUserFunctionResponse._();

  factory FetchUserFunctionResponse({
    required String id,
    required String firstName,
    required String lastName,
  }) = _FetchUserFunctionResponse;

  factory FetchUserFunctionResponse.fromJson(Map<String, Object?> json) =>
      _$FetchUserFunctionResponseFromJson(json);
}

class FirebaseFunctionException extends AppException {
  const FirebaseFunctionException(super.message);
}
