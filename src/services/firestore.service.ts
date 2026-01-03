import { firestore } from "@/lib/firebase-config";
import { EventConfigSchema, type EventConfig } from "@/types/event";
import { TeamSchema, type Team } from "@/types/team";
import { UserSchema } from "@/types/user";
import {
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
	updateDoc,
} from "firebase/firestore";

const collections = {
	users: "users",
	event: "event",
	teams: "teams",
};

export const firestoreService = {
	// this will fail if the user is a participant
	// and they try accessing other user's data
	fetchUser: async (userId: string) => {
		const userDocRef = doc(firestore, collections.users, userId);
		const userSnapshot = await getDoc(userDocRef);

		if (userSnapshot.exists()) {
			return UserSchema.parse(userSnapshot.data());
		}

		return null;
	},

	onTeamSnapshot: (
		teamId: string,
		callback: (data: Team | null) => void,
	) => {
		const teamDocRef = doc(firestore, collections.teams, teamId);
		return onSnapshot(teamDocRef, (snapshot) => {
			if (snapshot.exists()) {
				const data = TeamSchema.parse(snapshot.data());
				callback(data);
			}
			else {
				callback(null);
			}
		});
	},

	onEventConfigSnapshot: (callback: (config: EventConfig | null) => void) => {
		const eventDocRef = doc(firestore, collections.event, "main");

		return onSnapshot(eventDocRef, (snapshot) => {
			if (snapshot.exists()) {
				const data = EventConfigSchema.parse(snapshot.data());
				callback(data);
			} else {
				callback(null);
			}
		});
	},

	fetchEventConfig: async () => {
		const eventDocRef = doc(firestore, collections.event, "main");
		const eventSnapshot = await getDoc(eventDocRef);

		if (eventSnapshot.exists()) {
			return EventConfigSchema.parse(eventSnapshot.data());
		}

		return null;
	},

	updateEventConfig: async (data: Partial<EventConfig>) => {
		const eventDocRef = doc(firestore, collections.event, "main");
		await setDoc(eventDocRef, data, { merge: true });
	},

	clearEventConfig: async () => {
		const eventDocRef = doc(firestore, collections.event, "main");
		await deleteDoc(eventDocRef);
	},

	// this only works in debug mode. useful for testing different user roles
	debugSetUserType: async (
		userId: string,
		type: "organizer" | "participant",
	) => {
		if (import.meta.env.DEV) {
			const userDocRef = doc(firestore, collections.users, userId);
			const userSnapshot = await getDoc(userDocRef);

			if (userSnapshot.exists()) {
				const updatedData = {
					role: type,
				};
				await updateDoc(userDocRef, updatedData);
			}
		}
	},
	// for creating example users in debug mode
	debugCreateSampleParticipants: async () => {
		if (import.meta.env.DEV) {
			const sampleUsers = Array.from({ length: 10 }).map((_, i) => ({
				id: `sample-user-${i}`,
				username: `sampleuser${i}`,
				role: "participant" as const,
				email: `sampleuser${i}@example.com`,
				firstName: `Sample`,
				lastName: `User ${i}`,
				phone: "123-456-7890",
				shirtSize: "M",
				dietaryRestrictions: "None",
				rfidUUID: `rfid-${i}`,
				attendedEvents: [],
				hadFirstLunch: false,
				hadSecondLunch: false,
				hadBreakfast: false,
				hadDinner: false,
			}));

			for (const user of sampleUsers) {
				const userDocRef = doc(firestore, collections.users, user.id);
				await setDoc(userDocRef, user);
			}
		}
	},
};
