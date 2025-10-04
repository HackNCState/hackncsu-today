import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'functions_service.g.dart';
part 'functions_service.freezed.dart';

@riverpod
FirebaseFunctionsService firebaseFunctionsService(Ref ref) {
  return FirebaseFunctionsService();
}

class FirebaseFunctionsService {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;

  static const String _fetchUserEndpoint = 'fetchUser';

  /// fetches the user document from Firestore with the given user ID.
  /// returns only limited fields (name, last name, id) for public access.
  /// if the user is an organizer, it returns null.
  /// if the user is not found, it returns null.
  /// TODO: implement this
  Future<FetchPublicUserFunctionResponse?> fetchPublicUser(String id) async {
    try {
      final callable = _functions.httpsCallable(_fetchUserEndpoint);
      final response = await callable.call<RawFirebaseFunctionResponse?>({
        'id': id,
      });

      if (response.data != null) {
        return FetchPublicUserFunctionResponse.fromJson(response.data!);
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

/// note: this is used in the OAuthService
/// but it's here because an (oauth redirected) firebase function handles the authentication
@freezed
sealed class AuthenticateFunctionResponse with _$AuthenticateFunctionResponse {
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

/// Represents the response from the fetchUser Firebase function.
/// Contains the user's public information.
@freezed
sealed class FetchPublicUserFunctionResponse with _$FetchPublicUserFunctionResponse {
  FetchPublicUserFunctionResponse._();

  factory FetchPublicUserFunctionResponse({
    required String id,
    required String firstName,
    required String lastName,
  }) = _FetchPublicUserFunctionResponse;

  factory FetchPublicUserFunctionResponse.fromJson(Map<String, Object?> json) =>
      _$FetchPublicUserFunctionResponseFromJson(json);
}

class FirebaseFunctionException extends AppException {
  const FirebaseFunctionException(super.message);
}
