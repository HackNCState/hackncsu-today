import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/models/team.dart';
import 'package:hackncsu_today/services/firebase/functions_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'firestore_service.g.dart';

@riverpod
FirebaseFirestoreService firebaseFirestoreService(Ref ref) {
  return FirebaseFirestoreService();
}

/// Note: firestore rules are set up such that authenticated users may only
/// get/update their own user data. Cloud functions can be used to
/// get a small amount of data about other users
class FirebaseFirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static const String _usersCollection = 'users';
  static const String _eventCollection = 'event';
  static const String _teamsCollection = 'teams';

  static const String _eventStateDoc = 'state';
  static const String _eventDataDoc = 'data';

  /// creates a new user document in Firestore with the given data.
  /// if the user already exists, it returns the existing user document.
  /// this is meant for use in the login flow
  Future<HackUser> createUser(AuthenticateFunctionResponse response) async {
    final userDocRef = _firestore.collection(_usersCollection).doc(response.id);
    final docSnapshot = await userDocRef.get();

    if (docSnapshot.exists) {
      final existingUser = HackUser.fromJson(docSnapshot.data()!);

      // Skip this check in debug mode to allow for flexible testing with different user types
      if (!kDebugMode) {
        if (existingUser is Organizer && !response.isOrganizer) {
          throw FirebaseFirestoreException(
            'User with ID ${response.id} is an organizer, but previous records indicate they are not.',
          );
        } else if (existingUser is Participant && response.isOrganizer) {
          throw FirebaseFirestoreException(
            'User with ID ${response.id} is a participant, but previous records indicate they are an organizer.',
          );
        }
      }

      return existingUser;
    } else {
      final HackUser hackUser;

      if (response.isOrganizer) {
        hackUser = Organizer(id: response.id);
      } else {
        hackUser = Participant(
          id: response.id,
          firstName: response.firstName!,
          lastName: response.lastName!,
          phone: response.phone,
          email: response.email,
          dietaryRestrictions:
              [], // TODO: add ability to get dietary restrictions
          shirtSize: null,
          eventsAttended: [],
          hadFirstLunch: false,
          hadDinner: false,
          hadBreakfast: false,
          hadSecondLunch: false,
        );
      }

      await userDocRef.set(hackUser.toJson()).catchError((error) {
        throw FirebaseFirestoreException('Failed to create user data: $error');
      });
      return hackUser;
    }
  }

  /// updates the user document in Firestore with the given user data.
  Future<void> updateUser(HackUser user) async {
    _firestore
        .collection(_usersCollection)
        .doc(user.id)
        .set(user.toJson(), SetOptions(merge: true))
        .catchError((error) {
          throw FirebaseFirestoreException(
            'Failed to update user data: $error',
          );
        });
  }

  /// fetches the user data from Firestore for the given user ID.
  /// returns null if the user does not exist.
  /// NOTE: this will fail for participants if they try to fetch another user's data
  /// because of Firestore rules. they can only fetch their own data.
  /// or use cloud functions to fetch limited data about other users.
  Future<HackUser?> fetchUser(String userId) async {
    final userDocRef = _firestore.collection(_usersCollection).doc(userId);
    final docSnapshot = await userDocRef.get().catchError((error) {
      throw FirebaseFirestoreException('Failed to fetch user data: $error');
    });

    if (docSnapshot.exists) {
      return HackUser.fromJson(docSnapshot.data()!);
    } else {
      return null;
    }
  }

  /// Streams user data from Firestore for the given user ID.
  Stream<HackUser?> streamUser(String userId) {
    final userDocRef = _firestore.collection(_usersCollection).doc(userId);
    return userDocRef.snapshots().map((snapshot) {
      if (snapshot.exists && snapshot.data() != null) {
        return HackUser.fromJson(snapshot.data()!);
      }
      return null;
    });
  }

  /// fetches the team data from Firestore for the given team ID.
  /// returns null if the team does not exist.
  /// NOTE: this will fail for participants if they try to fetch another team's data.
  Future<Team?> fetchTeamData(String teamId) async {
    final teamDocRef = _firestore.collection(_teamsCollection).doc(teamId);
    final docSnapshot = await teamDocRef.get().catchError((error) {
      throw FirebaseFirestoreException('Failed to fetch team data: $error');
    });

    if (docSnapshot.exists) {
      return Team.fromJson(docSnapshot.data()!);
    } else {
      return null;
    }
  }

  /// Streams event data from Firestore.
  Stream<EventData?> streamEventData() {
    final eventDataRef = _firestore
        .collection(_eventCollection)
        .doc(_eventDataDoc);

    return eventDataRef.snapshots().map((snapshot) {
      if (snapshot.exists && snapshot.data() != null) {
        return EventData.fromJson(snapshot.data()!);
      }
      return null;
    });
  }

  /// Streams event state from Firestore
  Stream<EventState?> streamEventState() {
    final eventStateRef = _firestore
        .collection(_eventCollection)
        .doc(_eventStateDoc);

    return eventStateRef.snapshots().map((snapshot) {
      if (snapshot.exists && snapshot.data() != null) {
        return EventState.fromJson(snapshot.data()!);
      }
      return null;
    });
  }

  // Below are functions that are only authorized for organizers
  // They will fail for participants by nature of our Firestore rules

  /// initializes event in Firestore.
  /// this can be called from the admin panel to set up the event
  /// it should be called once at the start of the event
  /// and then we can update the relevant data as needed
  Future<void> initializeEvent() async {
    final eventData = EventData(
      tracks: [
        'Track 1',
        'Track 2',
        'Track 3',
      ],
      externalResources: [
        Resource.link('Hack_NCState Website', 'https://hackncstate.org'),
        Resource.link(
          'Centennial Map',
          'https://maps.ncsu.edu/#/buildings/783A',
        ),
      ],
      internalResources: [
        Resource.link('Discord Server', 'https://example.com', hidden: true),
        Resource.link('Schedule', 'https://example.com', hidden: true),
        Resource.link(
          'Opening Ceremony Slides',
          'https://hackncstate.org',
          hidden: true,
        ),
        Resource.action('Catering Options', ActionType.menu, hidden: true),
      ],
    );

    final stateRef = _firestore
        .collection(_eventCollection)
        .doc(_eventStateDoc);
    final dataRef = _firestore.collection(_eventCollection).doc(_eventDataDoc);

    final batch = _firestore.batch();

    batch.set(stateRef, EventState.initial().toJson());
    batch.set(dataRef, eventData.toJson());

    batch.commit().catchError((error) {
      throw FirebaseFirestoreException(
        'Failed to initialize event data: $error',
      );
    });
  }

  Future<void> updateEventData(EventData eventData) async {
    final dataRef = _firestore.collection(_eventCollection).doc(_eventDataDoc);

    await dataRef.set(eventData.toJson(), SetOptions(merge: true)).catchError((
      error,
    ) {
      throw FirebaseFirestoreException('Failed to update event data: $error');
    });
  }

  Future<void> updateEventState(EventState eventState) async {
    final stateRef = _firestore
        .collection(_eventCollection)
        .doc(_eventStateDoc);

    await stateRef.set(eventState.toJson(), SetOptions(merge: true)).catchError(
      (error) {
        throw FirebaseFirestoreException(
          'Failed to update event state: $error',
        );
      },
    );
  }

  // Below are functions that are used only during debugging

  /// Sets the user type (useful for debugging purposes).
  Future<void> debugSetUserType(String id, String type) async {
    if (kDebugMode) {
      _firestore
          .collection(_usersCollection)
          .doc(id)
          .update({'type': type})
          .catchError((error) {
            throw FirebaseFirestoreException('Failed to switch view: $error');
          });
    }
  }
}

class FirebaseFirestoreException extends AppException {
  const FirebaseFirestoreException(super.message);
}
