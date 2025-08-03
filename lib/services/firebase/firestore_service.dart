import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/exception.dart';
import 'package:hackncsu_today/models/event/event_data.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/services/firebase/functions_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'firestore_service.g.dart';

@riverpod
FirebaseFirestoreService firebaseFirestoreService(Ref ref) {
  return FirebaseFirestoreService();
}

/// note: firestore rules are set up such that authenticated users may only
/// get/update their own user data. cloud functions can be used to
/// get a small amount of data about other users
class FirebaseFirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static const String _usersCollection = 'users';
  static const String _eventCollection = "event";
  
  static const String _eventStateDoc = "state";
  static const String _eventDataDoc = "data";

  /// creates a new user document in Firestore with the given data.
  /// if the user already exists, it returns the existing user document.
  /// this is meant for use in the login flow
  Future<HackUser> createUserData(AuthenticateFunctionResponse response) async {
    final userDocRef = _firestore.collection(_usersCollection).doc(response.id);
    final docSnapshot = await userDocRef.get();

    if (docSnapshot.exists) {
      final existingUser = HackUser.fromJson(docSnapshot.data()!);

      if (existingUser is Organizer && !response.isOrganizer) {
        throw FirebaseFirestoreException(
          'User with ID ${response.id} is an organizer, but previous records indicate they are not.',
        );
      } else if (existingUser is Participant && response.isOrganizer) {
        throw FirebaseFirestoreException(
          'User with ID ${response.id} is a participant, but previous records indicate they are an organizer.',
        );
      }

      return existingUser;
    } else {
      // Create a new user document
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
  Future<void> updateUserData(HackUser user) async {
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
  Future<HackUser?> fetchUserData(String userId) async {
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

  // Below are functions that are only authorized for organizers
  // They will fail for participants by nature of our Firestore rules

  /// initializes event data in Firestore.
  /// this can be called from the admin panel to set up the event data
  /// it should be called once at the start of the event
  /// and then we can update the relevant data as needed
  Future<void> initializeEventData() async {
    final eventData = EventData(
      externalResources: [
        Resource.link("Hack_NCState Website", "https://hackncstate.org"),
        Resource.link(
          "Centennial Map",
          "https://maps.ncsu.edu/#/buildings/783A",
        ),
      ],
      internalResources: [
        Resource.link("Discord Server", "https://example.com", hidden: true),
        Resource.link("Schedule", "https://example.com", hidden: true),
        Resource.link("Opening Ceremony Slides", "https://hackncstate.org", hidden: true),
        Resource.internal("Catering Options", InternalResource.menu, hidden: true),
      ]
    );

    final stateRef = _firestore.collection(_eventCollection).doc(_eventStateDoc);
    final dataRef = _firestore.collection(_eventCollection).doc(_eventDataDoc);

    final batch = _firestore.batch();

    batch.set(stateRef, EventState.initial().toJson());
    batch.set(dataRef, eventData.toJson());

    batch.commit().catchError((error) {
      throw FirebaseFirestoreException('Failed to initialize event data: $error');
    });
  }
}

class FirebaseFirestoreException extends AppException {
  const FirebaseFirestoreException(super.message);
}
